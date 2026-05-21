// controllers/admin/admin.auth.controller.js
"use strict";
const BaseController = require("../BaseController");
const jwt = require("jsonwebtoken");
const Admin = require("../../models/Admin");

// ── Email helper ───────────────────────────────────────────────────────────────
const buildOtpEmail = (name, otp) => `
  <div dir="rtl" style="font-family:Arial;max-width:500px;margin:auto;padding:24px;
    border:1px solid #eee;border-radius:12px">
    <h2 style="color:#2d1b5a">إعادة تعيين كلمة المرور</h2>
    <p>مرحباً ${name}،</p>
    <p>استخدم الكود التالي لإعادة تعيين كلمة المرور. صالح لمدة 15 دقيقة.</p>
    <div style="background:#f3f0ff;border-radius:8px;padding:20px;text-align:center;margin:20px 0">
      <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#6d28d9">${otp}</span>
    </div>
    <p style="color:#888;font-size:13px">إذا لم تطلب هذا، تجاهل الرسالة.</p>
  </div>
`;

class AdminAuthController extends BaseController {
  constructor() {
    super();
    this.login = this.login.bind(this);
    this.getMe = this.getMe.bind(this);
    this.create = this.create.bind(this);
    this.list = this.list.bind(this);
    this.remove = this.remove.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
    this.changeOwnPassword = this.changeOwnPassword.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
    this.verifyOtp = this.verifyOtp.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
  }

  // ── POST /api/v1/admin/login ──────────────────────────────────────────────
  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return this.badRequest(res, "البريد الإلكتروني وكلمة المرور مطلوبان");

      const admin = await Admin.findOne({
        email: email.toLowerCase().trim(),
      }).select("+password");

      if (!admin || !admin.active)
        return this.unauthorized(res, "بيانات الدخول غير صحيحة");

      const match = await admin.matchPassword(password);
      if (!match) return this.unauthorized(res, "بيانات الدخول غير صحيحة");

      const token = jwt.sign(
        {
          userId: admin._id,
          email: admin.email,
          role: admin.role,
          isAdmin: true,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      );

      const adminObj = admin.toObject();
      delete adminObj.password;

      return this.success(res, { token, admin: adminObj }, "تم تسجيل الدخول");
    } catch (err) {
      return this.error(res, err.message);
    }
  }

  // ── GET /api/v1/admin/me ──────────────────────────────────────────────────
  async getMe(req, res) {
    try {
      const admin = await Admin.findById(req.userId);
      if (!admin) return this.notFound(res, "المسؤول غير موجود");
      return this.success(res, { admin });
    } catch (err) {
      return this.error(res, err.message);
    }
  }

  // ── PUT /api/v1/admin/me — update own profile ─────────────────────────────
  async updateProfile(req, res) {
    try {
      const { name, email } = req.body;
      const updates = {};
      if (name?.trim()) updates.name = name.trim();
      if (email?.trim()) updates.email = email.toLowerCase().trim();

      if (updates.email) {
        const existing = await Admin.findOne({
          email: updates.email,
          _id: { $ne: req.userId },
        });
        if (existing)
          return this.badRequest(res, "البريد الإلكتروني مستخدم بالفعل");
      }

      const admin = await Admin.findByIdAndUpdate(
        req.userId,
        { $set: updates },
        { new: true },
      );
      return this.success(res, { admin }, "تم تحديث الملف الشخصي");
    } catch (err) {
      return this.error(res, err.message);
    }
  }

  // ── PUT /api/v1/admin/me/password — change own password ──────────────────
  async changeOwnPassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword)
        return this.badRequest(res, "كلمة المرور الحالية والجديدة مطلوبتان");
      if (newPassword.length < 6)
        return this.badRequest(res, "كلمة المرور يجب أن تكون 6 أحرف على الأقل");

      const admin = await Admin.findById(req.userId).select("+password");
      if (!admin) return this.notFound(res, "المسؤول غير موجود");

      const match = await admin.matchPassword(currentPassword);
      if (!match)
        return this.unauthorized(res, "كلمة المرور الحالية غير صحيحة");

      admin.password = newPassword;
      await admin.save();

      return this.success(res, {}, "تم تغيير كلمة المرور بنجاح");
    } catch (err) {
      return this.error(res, err.message);
    }
  }

  // ── POST /api/v1/admin/admins — create new admin (superadmin only) ────────
  async create(req, res) {
    try {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password)
        return this.badRequest(res, "الاسم والبريد وكلمة المرور مطلوبة");

      const exists = await Admin.findOne({ email: email.toLowerCase() });
      if (exists)
        return this.badRequest(res, "البريد الإلكتروني مستخدم بالفعل");

      const admin = await Admin.create({
        name,
        email: email.toLowerCase().trim(),
        password,
        role: role || "admin",
      });

      const adminObj = admin.toObject();
      delete adminObj.password;

      return this.success(res, { admin: adminObj }, "تم إنشاء المسؤول");
    } catch (err) {
      return this.error(res, err.message);
    }
  }

  // ── GET /api/v1/admin/admins — list all admins ────────────────────────────
  async list(req, res) {
    try {
      const admins = await Admin.find().sort({ createdAt: -1 });
      return this.success(res, { admins });
    } catch (err) {
      return this.error(res, err.message);
    }
  }

  // ── DELETE /api/v1/admin/admins/:id ───────────────────────────────────────
  async remove(req, res) {
    try {
      if (req.params.id === String(req.userId))
        return this.badRequest(res, "لا يمكنك حذف حسابك الحالي");
      await Admin.findByIdAndDelete(req.params.id);
      return this.success(res, {}, "تم حذف المسؤول");
    } catch (err) {
      return this.error(res, err.message);
    }
  }

  // ── PUT /api/v1/admin/admins/:id/password ────────────────────────────────
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword)
        return this.badRequest(res, "كلمة المرور الحالية والجديدة مطلوبتان");

      const admin = await Admin.findById(req.params.id).select("+password");
      if (!admin) return this.notFound(res, "المسؤول غير موجود");

      const match = await admin.matchPassword(currentPassword);
      if (!match)
        return this.unauthorized(res, "كلمة المرور الحالية غير صحيحة");

      admin.password = newPassword;
      await admin.save();

      return this.success(res, {}, "تم تغيير كلمة المرور");
    } catch (err) {
      return this.error(res, err.message);
    }
  }

  // ── POST /api/v1/admin/forgot-password ───────────────────────────────────
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email) return this.badRequest(res, "البريد الإلكتروني مطلوب");

      const admin = await Admin.findOne({
        email: email.toLowerCase().trim(),
      }).select("+resetOtp +resetOtpExpires");

      // Always return success to prevent email enumeration
      if (!admin) {
        return this.success(
          res,
          {},
          "إذا كان البريد موجوداً ستصلك رسالة إعادة التعيين",
        );
      }

      // Generate 6-digit OTP valid 15 minutes
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 15 * 60 * 1000);

      admin.resetOtp = otp;
      admin.resetOtpExpires = expires;
      await admin.save();
      console.log("✅ OTP saved for:", admin.email, "OTP:", otp);

      // Send email using project transporter
      try {
        const { transporter } = require("../../services/email.service");
        await transporter.sendMail({
          from: `"د. أحمد الخطيب" <${process.env.GMAIL_USER || process.env.EMAIL_USER}>`,
          to: admin.email,
          subject: "إعادة تعيين كلمة المرور — لوحة التحكم",
          html: buildOtpEmail(admin.name, otp),
        });
        console.log("✅ Reset OTP email sent to:", admin.email);
      } catch (emailErr) {
        console.error("❌ Reset email error:", emailErr.message);
        if (process.env.NODE_ENV !== "production") {
          return this.success(
            res,
            { otp, note: "Email failed — OTP returned for dev only" },
            "تم إنشاء الكود (وضع التطوير)",
          );
        }
      }

      // Return masked email so user knows where to check
      const masked = admin.email.replace(
        /^(.{2})(.*)(@.*)$/,
        (_, a, b, c) => a + "*".repeat(Math.max(b.length, 3)) + c,
      );
      return this.success(
        res,
        { maskedEmail: masked },
        `تم إرسال كود التحقق إلى ${masked}`,
      );
    } catch (err) {
      return this.error(res, err.message);
    }
  }

  // ── POST /api/v1/admin/verify-otp — verify before step 3 ─────────────────
  async verifyOtp(req, res) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) return this.badRequest(res, "البريد والكود مطلوبان");

      const admin = await Admin.findOne({
        email: email.toLowerCase().trim(),
        resetOtp: otp,
        resetOtpExpires: { $gt: new Date() },
      }).select("+resetOtp +resetOtpExpires");

      if (!admin)
        return this.badRequest(res, "الكود غير صحيح أو منتهي الصلاحية");

      return this.success(res, {}, "الكود صحيح");
    } catch (err) {
      return this.error(res, err.message);
    }
  }

  // ── POST /api/v1/admin/reset-password ────────────────────────────────────
  async resetPassword(req, res) {
    try {
      const { email, otp, newPassword } = req.body;
      if (!email || !otp || !newPassword)
        return this.badRequest(res, "جميع الحقول مطلوبة");
      if (newPassword.length < 6)
        return this.badRequest(res, "كلمة المرور يجب أن تكون 6 أحرف على الأقل");

      const admin = await Admin.findOne({
        email: email.toLowerCase().trim(),
        resetOtp: otp,
        resetOtpExpires: { $gt: new Date() },
      }).select("+password +resetOtp +resetOtpExpires");

      if (!admin)
        return this.badRequest(res, "الكود غير صحيح أو منتهي الصلاحية");

      admin.password = newPassword;
      admin.resetOtp = undefined;
      admin.resetOtpExpires = undefined;
      await admin.save();

      return this.success(
        res,
        {},
        "تم تغيير كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.",
      );
    } catch (err) {
      return this.error(res, err.message);
    }
  }
}

module.exports = new AdminAuthController();
