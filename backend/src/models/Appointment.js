// models/Appointment.js
const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "medicalService",
      required: true,
    },
    date: {
      type: String, // Arabic date string for display
      required: true,
    },
    dateISO: {
      type: String, // ISO date for easier querying (YYYY-MM-DD)
      required: true,
    },
    time: {
      type: String, // Store as "09:00" format
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "no_show"],
      default: "pending",
    },
    paid: {
      type: Boolean,
      default: false,
    },
    // Personal info
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    country: String,
    city: String,
    message: String,
    // Medical info
    height: String,
    weight: String,
    age: String,
    chronicDiseases: String,
    currentMedications: String,
    currentHealthStatus: String,
    consultationGoal: String,
    // File uploads
    medicationsFile: String,
    testsFile: String,
    // Payment
    paymentIntentId: String,
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
appointmentSchema.index({ dateISO: 1, time: 1 });
appointmentSchema.index({ serviceId: 1, dateISO: 1 });

const Appointment =
  mongoose.models.appointment ||
  mongoose.model("appointment", appointmentSchema);
module.exports = Appointment;
