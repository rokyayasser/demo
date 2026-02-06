const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: "Please enter a valid email address",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    image: {
      type: String,
      default:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPAAAADwCAYAAAA+VemSAAAACXBIWXMAABCcAAAQnAEmzTo0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAA5uSURBVHgB7d0JchvHFcbxN+C+iaQolmzFsaWqHMA5QXID+wZJTmDnBLZu4BvER4hvYJ/AvoHlimPZRUnguoAg4PjwGJJiuGCd6df9/1UhoJZYJIBvXndPL5ndofljd8NW7bP8y79bZk9tmz8ATFdmu3nWfuiYfdNo2383389e3P5Xb9B82X1qs/YfU3AB1Cuzr+3cnt8U5Mb132i+7n5mc/a9EV4gDF37Z15Qv3/9a/fz63/0VgXOw/uFdexLAxCqLze3s+flL/4IcK/ydswrAxC0zoX9e+u9rJfVXoB7fV41m7u2YQBCt2tt+6v6xEUfeM6+ILyAGxv9QWbL+iPOPxoAX2Zts9GZtU8NgDudln3eyNvQnxgAd/Jw/k194I8NgD+ZPc2aO92uAXCpYQDcIsCAYwQYcIwAA44RYMAxAgw4RoABxwgw4BgBBhwjwIBjBBhwjAADjhFgwDECDDhGgAHHCDDgGAEGHCPAgGMEGHCMAAOOEWDAMQIMOEaAAccIMOAYAQYcI8CAYwQYcIwAA44RYMAxAgw4RoABxwgw4BgBBhwjwIBjBBhwjAADjhFgwDECDDhGgAHHCPD/2bMfW7etLAHgRyIlKpb7Y8l2E5M/2kig2puuy03/Pyggs9gfsL3sbnvT3k0wGIZCvpl74oiSGltxJb62KJv6+8Ck0yBPlf26R73Liwk4wAEGOMABBjjAAQY4wAEHOMABBjjAAQY4wAEHOMABDnCAAxxggAMc4AAHOMABDnCAAxzgeTNJxpKcyaNm1uy3Q3LqNMr57MCDZrZ7Z8yZz27Ix2bdHl5d+OTlz2Iu+TbmT5eRk5p1e2gXt4fk1GmW89mBB83u+3fX3pJTx3t+l7NuDxE+z5zN8emKc66zbi+dV5JzZt0ebi4+kFPHe37nrNtL55XknFm3l5uLD+TUmXV7ubn4QE6dWbeXm4sP5NTp/Dl1/f8v/Mx/J+PyP8njpgc5Zr8dPt4cOZZFOeazmyNnkgw7Wl6+f/NVfU9z4nY33OTcH3/sfVMf0pw4qxA4p1m3t/M83KibxbK8W34i59wvP82+4fefZjnf7i4O/0nOeZzmCvLbnEvnYfP1q+Or7zF3i2/bXwHeKq7v5Ue9vPVG+Az/5MfQH2CAAxxggAMc4AAHOMABBjjAAQY4wAEOMACf5L8C49fUQ8QZsgAAAABJRU5ErkJggg==",
    },
    address: {
      line1: { type: String, default: "" },
      line2: { type: String, default: "" },
      city: { type: String, default: "" },
      country: { type: String, default: "" },
      postalCode: { type: String, default: "" },
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Not Selected"],
      default: "Not Selected",
    },
    dob: {
      type: String,
      default: "Not Selected",
    },
    phone: {
      type: String,
      default: "000000000",
      validate: {
        validator: function (v) {
          return /^[+]?[0-9\s\-\(\)]{8,20}$/.test(v);
        },
        message: "Please enter a valid phone number",
      },
    },
    role: {
      type: String,
      enum: ["user", "admin", "doctor"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ name: "text", email: "text" });

// Virtual for full address
userSchema.virtual("fullAddress").get(function () {
  const parts = [];
  if (this.address.line1) parts.push(this.address.line1);
  if (this.address.line2) parts.push(this.address.line2);
  if (this.address.city) parts.push(this.address.city);
  if (this.address.country) parts.push(this.address.country);
  return parts.join(", ");
});

// ===== ADD THESE METHODS =====

// Method to increment login attempts
userSchema.methods.incLoginAttempts = async function () {
  // If lock has expired, reset attempts
  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.loginAttempts = 1;
    this.lockUntil = undefined;
  } else {
    this.loginAttempts += 1;
  }

  // Lock the account if too many failed attempts
  if (this.loginAttempts >= 5) {
    this.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
  }

  return this.save();
};

// Method to reset login attempts on successful login
userSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  return this.save();
};

// Method to check if account is locked
userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Password comparison method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Pre-save hook to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.models.user || mongoose.model("user", userSchema);
module.exports = User;
