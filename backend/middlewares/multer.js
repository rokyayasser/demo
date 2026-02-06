// multer.js - SIMPLIFIED VERSION
const multer = require("multer");

// Memory storage for ALL uploads
const storage = multer.memoryStorage();

// SIMPLIFIED file filter - accept all files for now
const fileFilter = (req, file, cb) => {
  console.log(
    `📁 File upload: ${file.fieldname} - ${file.mimetype} - ${file.originalname}`
  );

  // Accept all file types for debugging
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max for all files
  },
});

const checkUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error("Multer Error:", err);
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "حجم الملف كبير جداً. الحد الأقصى 100MB",
      });
    }
    return res.status(400).json({
      success: false,
      message: "خطأ في رفع الملف: " + err.message,
    });
  } else if (err) {
    console.error("Upload Error:", err);
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next();
};

module.exports = { upload, checkUploadErrors };
