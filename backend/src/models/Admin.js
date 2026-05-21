// src/models/Admin.js
"use strict";
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["superadmin", "admin"], default: "admin" },
    active: { type: Boolean, default: true },
    // Password reset OTP
    resetOtp: { type: String, select: false },
    resetOtpExpires: { type: Date, select: false },
  },
  { timestamps: true },
);

// Hash password before save
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
adminSchema.methods.matchPassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.models.Admin || mongoose.model("Admin", adminSchema);
