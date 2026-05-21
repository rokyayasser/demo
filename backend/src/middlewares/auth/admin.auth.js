// middlewares/auth/admin.auth.js
"use strict";
const jwt = require("jsonwebtoken");
const Admin = require("../../models/Admin");

/**
 * Middleware: verify admin JWT and confirm admin still exists in DB.
 * Attach req.userId, req.adminRole to the request.
 */
module.exports = async (req, res, next) => {
  try {
    const token =
      req.headers["token"] || req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "التوكن مطلوب" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res
        .status(401)
        .json({ success: false, message: "التوكن غير صالح أو منتهي الصلاحية" });
    }

    if (!decoded.isAdmin) {
      return res.status(403).json({ success: false, message: "غير مصرح لك" });
    }

    // Verify the admin still exists and is active in the DB
    const admin = await Admin.findById(decoded.userId);
    if (!admin || !admin.active) {
      return res
        .status(401)
        .json({ success: false, message: "الحساب غير موجود أو معطل" });
    }

    req.userId = decoded.userId;
    req.adminRole = admin.role; // "admin" | "superadmin"
    req.admin = admin;

    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
