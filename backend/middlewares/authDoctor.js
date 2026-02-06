const jwt = require("jsonwebtoken");

const authDoctor = async (req, res, next) => {
  try {
    const token =
      req.headers.token || req.headers.authorization?.replace("Bearer ", "");

    console.log("=== DOCTOR AUTH MIDDLEWARE ===");
    console.log("Token received:", token ? "Yes" : "No");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "الوصول مرفوض - الرجاء تسجيل الدخول",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Decoded token:", decoded);

    // Check if it's a doctor token
    if (!decoded.isDoctor) {
      return res.status(403).json({
        success: false,
        message: "الوصول مرفوض - ليس لديك صلاحية طبيب",
      });
    }

    // Add doctor info to request
    req.userId = decoded.userId;
    req.doctorEmail = decoded.email;
    req.isDoctor = true;

    console.log("✅ Doctor authenticated:", req.doctorEmail);

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
      message: "خطأ في المصادقة: " + error.message,
    });
  }
};

module.exports = authDoctor;
