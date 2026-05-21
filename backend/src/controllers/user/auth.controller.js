// controllers/user/auth.controller.js
const BaseController = require("../BaseController");
const User = require("../../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  userValidation,
} = require("../../middlewares/validation/user.validation");

class UserAuthController extends BaseController {
  constructor() {
    super();
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
    this.verifyOtp = this.verifyOtp.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
  }

  async register(req, res) {
    try {
      const { error, value } = userValidation.register.validate(req.body);
      if (error) {
        const errors = error.details.map((err) => ({
          field: err.path[0] || "unknown",
          message: err.message,
        }));
        return this.validationError(res, errors);
      }

      const {
        name,
        email,
        password,
        phone,
        address,
        gender,
        city,
        country,
        healthGoal,
        chronicDiseases,
      } = value;

      // Accept birthdate sent as either key
      const birthdateValue = value.birthdate || value.dob || null;

      // Convert height / weight strings to numbers
      const heightValue = value.height
        ? parseFloat(value.height) || null
        : null;
      const weightValue = value.weight
        ? parseFloat(value.weight) || null
        : null;

      // Duplicate email check
      const existing = await User.findOne({ email });
      if (existing) return this.conflict(res, "البريد الإلكتروني مسجل بالفعل");

      // Normalise address
      let processedAddress = "";
      if (address && typeof address === "object") {
        const hasData = address.line1 || address.city || address.country;
        processedAddress = hasData ? address : "";
      } else if (typeof address === "string") {
        processedAddress = address;
      }

      // ── Create user with the PLAIN password ──────────────────────────────
      // The pre-save hook in User.js will hash it automatically.
      // Do NOT call bcrypt.hash here — that would cause double-hashing.
      const user = new User({
        name,
        email,
        password, // ← plain text; hook hashes it
        phone,
        address: processedAddress,
        gender: gender || "غير محدد",
        dob: birthdateValue,
        height: heightValue,
        weight: weightValue,
        city: city || "",
        country: country || "",
        healthGoal: healthGoal || "",
        chronicDiseases: chronicDiseases || "لا يوجد",
      });

      await user.save();

      const token = jwt.sign(
        { id: user._id, email: user.email, role: "user" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      );

      const userResponse = user.toObject();
      delete userResponse.password;

      return this.success(
        res,
        { user: userResponse, token },
        "تم إنشاء الحساب بنجاح",
      );
    } catch (err) {
      console.error("Registration error:", err);
      return this.error(res, "حدث خطأ أثناء إنشاء الحساب");
    }
  }

  async login(req, res) {
    try {
      const { error, value } = userValidation.login.validate(req.body);
      if (error) {
        const errors = error.details.map((err) => ({
          field: err.path[0] || "unknown",
          message: err.message,
        }));
        return this.validationError(res, errors);
      }

      const { email, password } = value;

      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return this.unauthorized(
          res,
          "البريد الإلكتروني أو كلمة المرور غير صحيحة",
        );
      }

      if (user.isLocked()) {
        return this.tooManyRequests(
          res,
          "الحساب مقفل. يرجى المحاولة مرة أخرى لاحقاً",
        );
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        await user.incLoginAttempts();
        return this.unauthorized(
          res,
          "البريد الإلكتروني أو كلمة المرور غير صحيحة",
        );
      }

      await user.resetLoginAttempts();
      user.lastLogin = new Date();
      // Use updateOne to avoid triggering the password pre-save hook
      await User.updateOne({ _id: user._id }, { lastLogin: user.lastLogin });

      const token = jwt.sign(
        { id: user._id, email: user.email, role: "user" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      );

      const userResponse = user.toObject();
      delete userResponse.password;

      return this.success(
        res,
        { user: userResponse, token },
        "تم تسجيل الدخول بنجاح",
      );
    } catch (err) {
      console.error("Login error:", err);
      return this.error(res, "حدث خطأ أثناء تسجيل الدخول");
    }
  }

  // ── POST /api/v1/user/forgot-password ────────────────────────────────────
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email) return this.badRequest(res, "البريد الإلكتروني مطلوب");

      const user = await User.findOne({
        email: email.toLowerCase().trim(),
      }).select("+resetOtp +resetOtpExpires");

      if (!user) {
        // Don't reveal if email exists
        return this.success(
          res,
          {},
          "إذا كان البريد موجوداً ستصلك رسالة إعادة التعيين",
        );
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 15 * 60 * 1000);

      user.resetOtp = otp;
      user.resetOtpExpires = expires;
      await user.save();
      console.log("✅ User OTP saved for:", user.email, "OTP:", otp);

      try {
        const { transporter } = require("../../services/email.service");
        await transporter.sendMail({
          from: `"د. أحمد الخطيب" <${process.env.GMAIL_USER || process.env.EMAIL_USER}>`,
          to: user.email,
          subject: "إعادة تعيين كلمة المرور",
          html: `
            <div dir="rtl" style="font-family:Arial;max-width:500px;margin:auto;padding:24px;
              border:1px solid #eee;border-radius:12px">
              <h2 style="color:#2d1b5a">إعادة تعيين كلمة المرور</h2>
              <p>مرحباً ${user.name}،</p>
              <p>استخدم الكود التالي لإعادة تعيين كلمة المرور. صالح لمدة 15 دقيقة.</p>
              <div style="background:#f3f0ff;border-radius:8px;padding:20px;
                text-align:center;margin:20px 0">
                <span style="font-size:36px;font-weight:bold;
                  letter-spacing:8px;color:#6d28d9">${otp}</span>
              </div>
              <p style="color:#888;font-size:13px">إذا لم تطلب هذا، تجاهل الرسالة.</p>
            </div>`,
        });
        console.log("✅ Reset email sent to:", user.email);
      } catch (emailErr) {
        console.error("❌ Email error:", emailErr.message);
        if (process.env.NODE_ENV !== "production") {
          return this.success(
            res,
            { otp, note: "Email failed — OTP in dev mode" },
            "تم إنشاء الكود (وضع التطوير)",
          );
        }
      }

      const masked = user.email.replace(
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

  // ── POST /api/v1/user/verify-otp ─────────────────────────────────────────
  async verifyOtp(req, res) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) return this.badRequest(res, "البريد والكود مطلوبان");

      const user = await User.findOne({
        email: email.toLowerCase().trim(),
        resetOtp: otp,
        resetOtpExpires: { $gt: new Date() },
      }).select("+resetOtp +resetOtpExpires");

      if (!user)
        return this.badRequest(res, "الكود غير صحيح أو منتهي الصلاحية");

      return this.success(res, {}, "الكود صحيح");
    } catch (err) {
      return this.error(res, err.message);
    }
  }

  // ── POST /api/v1/user/reset-password ─────────────────────────────────────
  async resetPassword(req, res) {
    try {
      const { email, otp, newPassword } = req.body;
      if (!email || !otp || !newPassword)
        return this.badRequest(res, "جميع الحقول مطلوبة");
      if (newPassword.length < 8)
        return this.badRequest(res, "كلمة المرور يجب أن تكون 8 أحرف على الأقل");

      const user = await User.findOne({
        email: email.toLowerCase().trim(),
        resetOtp: otp,
        resetOtpExpires: { $gt: new Date() },
      }).select("+password +resetOtp +resetOtpExpires");

      if (!user)
        return this.badRequest(res, "الكود غير صحيح أو منتهي الصلاحية");

      user.password = newPassword;
      user.resetOtp = undefined;
      user.resetOtpExpires = undefined;
      await user.save();

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

module.exports = new UserAuthController();
