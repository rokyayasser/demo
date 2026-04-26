const mongoose = require("mongoose");

const courseEnrollmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "course",
      required: true,
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    completedLessons: [{ type: String }],
    enrolledAt: { type: Date, default: Date.now },
    completedAt: { type: Date },

    // Payment tracking
    paid: { type: Boolean, default: false, index: true },
    paymobOrderId: { type: String },
    paymobMerchantOrderId: { type: String },
    paymobTransactionId: { type: String },
    paymentDate: { type: Date },
  },
  { timestamps: true },
);

// One enrollment per user per course
courseEnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
courseEnrollmentSchema.index({ paymobOrderId: 1 });

const CourseEnrollment =
  mongoose.models.courseEnrollment ||
  mongoose.model("courseEnrollment", courseEnrollmentSchema);

module.exports = CourseEnrollment;
