const jwt = require("jsonwebtoken");

const authAdmin = async (req, res, next) => {
  try {
    const token =
      req.headers.token || req.headers.authorization?.replace("Bearer ", "");

    console.log("=== ADMIN AUTH MIDDLEWARE ===");
    console.log("Token received:", token ? "Yes" : "No");

    if (!token) {
      return res.json({
        success: false,
        message: "الوصول مرفوض - الرجاء تسجيل الدخول",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Decoded token:", decoded);

    // Check if it's an admin token
    if (decoded.email !== process.env.ADMIN_EMAIL) {
      return res.json({
        success: false,
        message: "الوصول مرفوض - ليس لديك صلاحية إدارية",
      });
    }

    // Add admin info to request
    req.userId = "admin"; // Changed from decoded.userId to "admin"
    req.adminEmail = decoded.email;
    req.isAdmin = true;

    console.log("✅ Admin authenticated:", req.adminEmail);

    next();
  } catch (error) {
    console.error("❌ Admin auth error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.json({
        success: false,
        message: "انتهت صلاحية الجلسة - الرجاء تسجيل الدخول مرة أخرى",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.json({
        success: false,
        message: "رمز الدخول غير صالح",
      });
    }

    res.json({
      success: false,
      message: "خطأ في المصادقة: " + error.message,
    });
  }
};

module.exports = authAdmin;
