const jwt = require("jsonwebtoken");

const authUser = async (req, res, next) => {
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

    if (!decoded.id) {
      return res.status(401).json({
        success: false,
        message: "رمز الدخول غير صالح",
      });
    }

    req.userId = decoded.id;
    req.userEmail = decoded.email;
    req.userRole = decoded.role || "user";

    next();
  } catch (error) {
    console.error("❌ User auth error:", error.message);

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

module.exports = authUser;
