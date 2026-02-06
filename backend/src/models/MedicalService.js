const mongoose = require("mongoose");

const medicalServiceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    title_ar: {
      type: String,
      required: [true, "Arabic title is required"],
      trim: true,
      minlength: [2, "Arabic title must be at least 2 characters"],
      maxlength: [200, "Arabic title cannot exceed 200 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      index: true,
    },
    category_ar: {
      type: String,
      required: [true, "Arabic category is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Image is required"],
    },
    features: {
      type: [String],
      required: [true, "Features are required"],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "At least one feature is required",
      },
    },
    fees: {
      type: Number,
      required: [true, "Fees are required"],
      min: [0, "Fees cannot be negative"],
    },
    duration: {
      type: String,
      default: "30 minutes",
    },
    available: {
      type: Boolean,
      default: true,
      index: true,
    },
    slots_booked: {
      type: Object,
      default: {},
    },
    meta: {
      views: { type: Number, default: 0 },
      bookings: { type: Number, default: 0 },
      rating: { type: Number, default: 0, min: 0, max: 5 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
medicalServiceSchema.index({ category: 1, available: 1 });
medicalServiceSchema.index({
  title: "text",
  title_ar: "text",
  description: "text",
});
medicalServiceSchema.index({ fees: 1 });
medicalServiceSchema.index({ createdAt: -1 });

// Virtual for Arabic availability status
medicalServiceSchema.virtual("availability_ar").get(function () {
  return this.available ? "متاح" : "غير متاح";
});

// Virtual for formatted fees
medicalServiceSchema.virtual("formattedFees").get(function () {
  return `${this.fees.toLocaleString("ar-EG")} جنيه`;
});

// Pre-save middleware
medicalServiceSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const MedicalService =
  mongoose.models.medicalService ||
  mongoose.model("medicalService", medicalServiceSchema);

module.exports = MedicalService;
