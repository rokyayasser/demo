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
}

module.exports = new UserAuthController();
