// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "الاسم مطلوب"],
      trim: true,
      minlength: [2, "الاسم يجب أن يكون على الأقل حرفين"],
      maxlength: [100, "الاسم لا يمكن أن يتجاوز 100 حرف"],
    },
    email: {
      type: String,
      required: [true, "البريد الإلكتروني مطلوب"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "يرجى إدخال بريد إلكتروني صالح"],
    },
    password: {
      type: String,
      required: [true, "كلمة المرور مطلوبة"],
      minlength: [8, "كلمة المرور يجب أن تكون على الأقل 8 أحرف"],
      select: false,
    },
    phone: {
      type: String,
      required: [true, "رقم الهاتف مطلوب"],
      match: [/^[+]?[0-9\s\-\(\)]{8,20}$/, "يرجى إدخال رقم هاتف صالح"],
    },
    address: {
      type: mongoose.Schema.Types.Mixed,
      default: "",
    },
    gender: {
      type: String,
      enum: ["ذكر", "أنثي", "Male", "Female", "غير محدد"],
      default: "غير محدد",
    },
    dob: { type: Date },
    height: {
      type: Number,
      min: [50, "الطول يجب أن يكون بين 50 و 250 سم"],
      max: [250, "الطول يجب أن يكون بين 50 و 250 سم"],
    },
    weight: {
      type: Number,
      min: [10, "الوزن يجب أن يكون بين 10 و 300 كجم"],
      max: [300, "الوزن يجب أن يكون بين 10 و 300 كجم"],
    },
    city: { type: String, trim: true, default: "" },
    country: { type: String, trim: true, default: "" },
    healthGoal: { type: String, trim: true, default: "" },
    chronicDiseases: { type: String, default: "لا يوجد" },
    image: { type: String, default: "" },
    lastLogin: { type: Date },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    role: {
      type: String,
      enum: ["user", "admin", "doctor"],
      default: "user",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ─── Pre-save: hash password ONLY when it has been modified ──────────────────
// This is the SINGLE place where hashing happens.
// The controller must NOT hash the password before calling user.save() —
// doing so causes double-hashing and makes login always fail.
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ─── Pre-save: normalise address ─────────────────────────────────────────────
userSchema.pre("save", function (next) {
  if (this.address && typeof this.address === "object") {
    const hasData =
      this.address.line1 || this.address.city || this.address.country;
    if (!hasData) this.address = "";
  }
  next();
});

// ─── Instance methods ─────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

userSchema.methods.incLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.loginAttempts = 1;
    this.lockUntil = undefined;
  } else {
    this.loginAttempts += 1;
    if (this.loginAttempts >= 5 && !this.lockUntil) {
      this.lockUntil = Date.now() + 30 * 60 * 1000; // lock 30 min
    }
  }
  await this.save();
};

userSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  await this.save();
};

// ─── Virtuals ────────────────────────────────────────────────────────────────
userSchema.virtual("addressString").get(function () {
  if (typeof this.address === "string") return this.address;
  if (this.address && typeof this.address === "object") {
    return [this.address.line1, this.address.city, this.address.country]
      .filter(Boolean)
      .join(", ");
  }
  return "";
});

const User = mongoose.models.user || mongoose.model("user", userSchema);
module.exports = User;
