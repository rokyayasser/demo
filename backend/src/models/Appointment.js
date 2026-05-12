// src/models/Appointment.js
"use strict";
const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    // ── References ─────────────────────────────────────────────────────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "medicalService",
      required: true,
    },

    // ── Appointment info ────────────────────────────────────────────────────────
    date: { type: String, required: true }, // Arabic display date "الجمعة، 25 أبريل 2026"
    dateISO: { type: String, required: true }, // ISO date "2026-04-25" for queries
    time: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    paid: { type: Boolean, default: false },
    amount: { type: Number, default: 0 },
    category: { type: String, default: "" },

    // ── Patient personal info ──────────────────────────────────────────────────
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    country: { type: String, default: "" },
    city: { type: String, default: "" },

    // ── Health data ────────────────────────────────────────────────────────────
    height: { type: String, default: "0" },
    weight: { type: String, default: "0" },
    age: { type: String, default: "0" },
    chronicDiseases: { type: String, default: "لا يوجد" },
    currentHealthStatus: { type: String, default: "" },
    consultationGoal: { type: String, default: "" },
    message: { type: String, default: "" },

    // ── Medications ────────────────────────────────────────────────────────────
    currentMedications: { type: String, default: "" }, // free-text medications list
    medicationsFile: { type: String, default: null }, // single file URL (PDF/image)

    // ── Medical tests ──────────────────────────────────────────────────────────
    // Array of { url, name } — supports multiple files
    // url is NOT strictly required so a failed upload doesn't block the booking
    testsFiles: [
      {
        url: { type: String, default: null },
        name: { type: String, default: "" },
      },
    ],
    // Legacy: single file string (kept for backward compatibility)
    testsFile: { type: String, default: null },

    // ── Payment ────────────────────────────────────────────────────────────────
    paymentId: { type: String, default: null },
    paymobOrderId: { type: String, default: null },
    paymobTransactionId: { type: String, default: null },
  },
  { timestamps: true },
);

// Virtual: full patient name
appointmentSchema.virtual("name").get(function () {
  return `${this.firstName || ""} ${this.lastName || ""}`.trim();
});

appointmentSchema.set("toJSON", { virtuals: true });
appointmentSchema.set("toObject", { virtuals: true });

module.exports =
  mongoose.models.Appointment ||
  mongoose.model("Appointment", appointmentSchema);
