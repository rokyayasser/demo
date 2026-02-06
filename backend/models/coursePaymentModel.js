// models/coursePaymentModel.js
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "course",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "EGP",
    },
    status: {
      type: String,
      enum: ["initiated", "pending", "completed", "failed", "refunded"], // Added "initiated"
      default: "initiated",
    },
    paymobOrderId: String,
    paymobTransactionId: String,
    paymobMerchantOrderId: String,
    paymentMethod: String,
    paymentDate: Date,
    paymentInitiatedAt: Date,
    metadata: mongoose.Schema.Types.Mixed,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const paymentModel =
  mongoose.models.course_payment ||
  mongoose.model("course_payment", paymentSchema);

module.exports = paymentModel;
