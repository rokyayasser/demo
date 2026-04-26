// src/models/BlockedSlot.js
// Place this file at: src/models/BlockedSlot.js
// (same folder as Appointment.js, User.js etc.)
"use strict";
const mongoose = require("mongoose");

const blockedSlotSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, index: true }, // "2026-04-17"
    time: { type: String, required: true }, // "١٠:٣٠ ص"
    reason: { type: String, default: "" },
    blockedBy: { type: String, default: "admin" },
  },
  { timestamps: true },
);

// Unique compound index — prevents duplicate date+time entries
blockedSlotSchema.index({ date: 1, time: 1 }, { unique: true });

// Safe registration — works on hot reload and fresh start
const BlockedSlot =
  mongoose.models.BlockedSlot ||
  mongoose.model("BlockedSlot", blockedSlotSchema);

module.exports = BlockedSlot;
