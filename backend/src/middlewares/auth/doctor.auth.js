const jwt = require("jsonwebtoken");

const authDoctor = async (req, res, next) => {
  try {
    const token =
      req.headers.token || req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "الوصول مرفوض - الرجاء تسجيل الدخول",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if it's a doctor token
    if (
      decoded.email !== process.env.DOCTOR_EMAIL ||
      decoded.role !== "doctor"
    ) {
      return res.status(403).json({
        success: false,
        message: "الوصول مرفوض - ليس لديك صلاحية طبيب",
      });
    }

    req.userId = "doctor";
    req.doctorEmail = decoded.email;
    req.isDoctor = true;
    req.userRole = "doctor";

    next();
  } catch (error) {
    console.error("❌ Doctor auth error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "انتهت صلاحية الجلسة - الرجاء تسجيل الدخول مرة أخرى",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "رمز الدخول غير صالح",
      });
    }

    res.status(500).json({
      success: false,
      message: "خطأ في المصادقة",
    });
  }
};

module.exports = authDoctor;
