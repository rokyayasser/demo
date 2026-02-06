const Busboy = require("busboy");

const parseFormData = (req, res, next) => {
  const contentType = req.headers["content-type"];

  // Only parse if it's multipart/form-data
  if (!contentType || !contentType.includes("multipart/form-data")) {
    console.log("Not multipart/form-data, skipping parser");
    return next();
  }

  console.log("🔧 Parsing multipart/form-data with Busboy...");

  const busboy = Busboy({
    headers: req.headers,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
      files: 5, // Max 5 files
    },
  });

  const fields = {};
  const files = {};

  busboy.on("field", (fieldname, val) => {
    console.log(`📝 Field: ${fieldname} = ${val.substring(0, 50)}...`);
    fields[fieldname] = val;
  });

  busboy.on("file", (fieldname, file, info) => {
    console.log(`📁 File: ${fieldname} - ${info.filename} (${info.mimeType})`);

    const chunks = [];
    file.on("data", (chunk) => {
      chunks.push(chunk);
    });

    file.on("end", () => {
      const buffer = Buffer.concat(chunks);
      files[fieldname] = {
        buffer: buffer,
        originalname: info.filename,
        mimetype: info.mimeType,
        size: buffer.length,
        encoding: info.encoding,
        fieldname: fieldname,
      };
    });

    file.on("error", (err) => {
      console.error(`File error for ${fieldname}:`, err);
    });
  });

  busboy.on("finish", () => {
    console.log("✅ Busboy parsing complete!");
    console.log("📋 Fields found:", Object.keys(fields).length);
    console.log("📁 Files found:", Object.keys(files).length);

    req.body = fields;
    req.files = files;

    next();
  });

  busboy.on("error", (err) => {
    console.error("❌ Busboy parsing error:", err);
    return res.status(400).json({
      success: false,
      message: "Error parsing form data",
    });
  });

  req.pipe(busboy);
};

module.exports = parseFormData;
