const BaseController = require("../BaseController");
const axios = require("axios");
const path = require("path");
const fs = require("fs");

class DownloadController extends BaseController {
  constructor() {
    super();
    this.downloadFile = this.downloadFile.bind(this);
    this.downloadLocalFile = this.downloadLocalFile.bind(this);
  }

  async downloadFile(req, res) {
    try {
      const { fileUrl, fileName, disposition = "attachment" } = req.query;

      console.log("=== DOWNLOAD FILE REQUEST ===");
      console.log("File URL:", fileUrl);
      console.log("Requested file name:", fileName);
      console.log("Disposition:", disposition);

      if (!fileUrl) {
        return this.badRequest(res, "File URL is required");
      }

      // Validate URL
      try {
        new URL(fileUrl);
      } catch (error) {
        return this.badRequest(res, "Invalid file URL");
      }

      // Set disposition: 'inline' for viewing, 'attachment' for downloading
      const contentDisposition =
        disposition === "inline" ? "inline" : "attachment";

      // Fetch the file
      const response = await axios({
        method: "GET",
        url: fileUrl,
        responseType: "stream",
        timeout: 60000,
        maxRedirects: 5,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      // Get content type from response or default
      const contentType =
        response.headers["content-type"] || "application/octet-stream";

      // Determine file name
      let finalFileName = fileName || "download";

      // Try to extract file extension from URL
      try {
        const urlPath = new URL(fileUrl).pathname;
        const extension = path.extname(urlPath);
        if (
          extension &&
          extension.length <= 8 &&
          !finalFileName.endsWith(extension)
        ) {
          finalFileName += extension;
        }
      } catch (error) {
        console.warn("Could not extract extension from URL:", error.message);
      }

      // Try to extract file name from Content-Disposition header
      if (response.headers["content-disposition"]) {
        const matches = response.headers["content-disposition"].match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        );
        if (matches && matches[1]) {
          let extractedName = matches[1].replace(/['"]/g, "");
          // Decode URL encoded file names
          extractedName = decodeURIComponent(extractedName);
          if (extractedName) {
            finalFileName = extractedName;
          }
        }
      }

      // Set response headers
      res.setHeader("Content-Type", contentType);
      res.setHeader(
        "Content-Disposition",
        `${contentDisposition}; filename="${encodeURIComponent(finalFileName)}"`
      );

      if (response.headers["content-length"]) {
        res.setHeader("Content-Length", response.headers["content-length"]);
      }

      // Pipe the file stream to response
      response.data.pipe(res);

      // Handle stream errors
      response.data.on("error", (err) => {
        console.error("Stream error:", err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: "File stream failed",
          });
        }
      });
    } catch (error) {
      console.error("Download Error:", {
        message: error.message,
        code: error.code,
        response: error.response?.status,
        url: req.query.fileUrl,
      });

      if (!res.headersSent) {
        if (error.code === "ENOTFOUND") {
          return this.error(res, "File server not found", 404);
        }
        if (error.response?.status === 404) {
          return this.error(res, "File not found on remote server", 404);
        }
        if (error.response?.status === 403) {
          return this.error(res, "Access to file denied", 403);
        }
        if (error.code === "ECONNABORTED") {
          return this.error(
            res,
            "Connection timeout while downloading file",
            504
          );
        }

        return this.error(res, error.message || "Download failed");
      }
    }
  }

  async downloadLocalFile(req, res) {
    try {
      const { filePath, fileName } = req.query;

      console.log("=== DOWNLOAD LOCAL FILE ===");
      console.log("File path:", filePath);

      if (!filePath) {
        return this.badRequest(res, "File path is required");
      }

      // Security check: prevent directory traversal
      const normalizedPath = path.normalize(filePath);
      if (normalizedPath.includes("..")) {
        return this.forbidden(res, "Invalid file path");
      }

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return this.notFound(res, "File not found");
      }

      // Get file stats
      const stats = fs.statSync(filePath);
      if (!stats.isFile()) {
        return this.badRequest(res, "Path is not a file");
      }

      // Determine content type based on file extension
      const extension = path.extname(filePath).toLowerCase();
      const contentType = this.getContentType(extension);

      // Determine file name for download
      const downloadFileName = fileName || path.basename(filePath);

      // Set headers
      res.setHeader("Content-Type", contentType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(downloadFileName)}"`
      );
      res.setHeader("Content-Length", stats.size);

      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      // Handle stream errors
      fileStream.on("error", (err) => {
        console.error("File stream error:", err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: "File stream error",
          });
        }
      });
    } catch (error) {
      console.error("Download Local File Error:", error);
      if (!res.headersSent) {
        return this.error(res, error.message);
      }
    }
  }

  getContentType(extension) {
    const contentTypeMap = {
      ".pdf": "application/pdf",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".txt": "text/plain",
      ".html": "text/html",
      ".css": "text/css",
      ".js": "application/javascript",
      ".json": "application/json",
      ".xml": "application/xml",
      ".doc": "application/msword",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".xls": "application/vnd.ms-excel",
      ".xlsx":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ".ppt": "application/vnd.ms-powerpoint",
      ".pptx":
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ".zip": "application/zip",
      ".rar": "application/x-rar-compressed",
      ".mp3": "audio/mpeg",
      ".mp4": "video/mp4",
      ".avi": "video/x-msvideo",
    };

    return contentTypeMap[extension] || "application/octet-stream";
  }

  // Helper method to download Cloudinary files
  async downloadCloudinaryFile(req, res) {
    try {
      const { publicId, resourceType = "image", fileName } = req.query;

      if (!publicId) {
        return this.badRequest(res, "Public ID is required");
      }

      // Generate Cloudinary URL
      const cloudinary = require("../../config/cloudinary");
      const cloudinaryUrl = cloudinary.generateImageUrl(publicId, {
        resource_type: resourceType,
        flags: "attachment",
      });

      // Redirect to Cloudinary URL for download
      res.redirect(cloudinaryUrl);
    } catch (error) {
      console.error("Cloudinary Download Error:", error);
      return this.error(res, error.message);
    }
  }
}

module.exports = new DownloadController();
