const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
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
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "payment",
    },
    amountPaid: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["paymob", "vodafone_cash", "bank_transfer"],
      default: "paymob",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled", "refunded"],
      default: "completed",
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    completedLessons: [
      {
        lessonId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        completedAt: {
          type: Date,
          default: Date.now,
        },
        progress: {
          type: Number,
          min: 0,
          max: 100,
          default: 0,
        },
      },
    ],
    totalProgress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
    certificateIssued: {
      type: Boolean,
      default: false,
    },
    certificateIssuedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// مركب فريد لمنع التسجيل المكرر
enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const enrollmentModel =
  mongoose.models.enrollment || mongoose.model("enrollment", enrollmentSchema);

module.exports = enrollmentModel;
