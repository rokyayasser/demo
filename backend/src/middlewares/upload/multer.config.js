const multer = require("multer");
const path = require("path");

// Memory storage configuration
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  console.log(`📁 File upload attempt: ${file.fieldname} - ${file.mimetype}`);

  // Accept images
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  }
  // Accept PDFs
  else if (file.mimetype === "application/pdf") {
    cb(null, true);
  }
  // Accept common document types
  else if (
    file.mimetype === "application/msword" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.mimetype === "application/vnd.ms-excel" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    cb(null, true);
  }
  // Reject other file types
  else {
    cb(new Error("نوع الملف غير مدعوم. يرجى رفع صور أو ملفات PDF فقط"), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 5, // Max 5 files
  },
});

// Error handler middleware
const checkUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error("Multer Error:", err);

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "حجم الملف كبير جداً. الحد الأقصى 10MB",
      });
    }

    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "تم تجاوز الحد الأقصى لعدد الملفات (5 ملفات)",
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

module.exports = {
  upload,
  checkUploadErrors,

  // Single file upload
  single: (fieldName) => upload.single(fieldName),

  // Multiple files upload
  array: (fieldName, maxCount) => upload.array(fieldName, maxCount),

  // Multiple fields with different file counts
  fields: (fields) => upload.fields(fields),
};
