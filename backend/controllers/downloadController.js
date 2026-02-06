// controllers/downloadController.js
const axios = require("axios");

const downloadFile = async (req, res) => {
  try {
    const { fileUrl, fileName, disposition } = req.query;

    if (!fileUrl) {
      return res.status(400).json({
        success: false,
        message: "File URL is required",
        arabicMessage: "رابط الملف مطلوب",
      });
    }

    // inline = view , attachment = download
    const dispo = disposition === "inline" ? "inline" : "attachment";

    const upstream = await axios.get(fileUrl, {
      responseType: "stream",
      timeout: 60000,
      maxRedirects: 5,
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const contentType =
      upstream.headers["content-type"] || "application/octet-stream";

    // 🔴 DO NOT GUESS EXTENSION FROM content-type
    let finalName = (fileName || "download").trim();

    // Try to extract extension from original URL
    try {
      const cleanUrl = fileUrl.split("?")[0];
      const ext = cleanUrl.substring(cleanUrl.lastIndexOf("."));
      if (ext && ext.length <= 6 && !finalName.endsWith(ext)) {
        finalName += ext;
      }
    } catch (e) {}

    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `${dispo}; filename*=UTF-8''${encodeURIComponent(finalName)}`
    );

    if (upstream.headers["content-length"]) {
      res.setHeader("Content-Length", upstream.headers["content-length"]);
    }

    upstream.data.pipe(res);

    upstream.data.on("error", (err) => {
      console.error("Stream error:", err);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "File stream failed",
          arabicMessage: "فشل تحميل الملف",
        });
      }
    });
  } catch (err) {
    console.error("Download controller error:", {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data,
    });

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: err.message || "Download failed",
        arabicMessage: "حدث خطأ أثناء تحميل الملف",
      });
    }
  }
};

module.exports = { downloadFile };
