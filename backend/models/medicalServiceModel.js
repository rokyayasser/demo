const mongoose = require("mongoose");

const medicalServiceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    title_ar: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    category_ar: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    features: {
      type: [String],
      required: true,
    },
    fees: {
      type: Number,
      required: true,
    },
    duration: {
      type: String,
      default: "30 minutes",
    },
    available: {
      type: Boolean,
      default: true,
    },
    slots_booked: {
      type: Object,
      default: {},
    },
    date: {
      type: Number,
      required: true,
    },
  },
  { minimize: false }
);

const medicalServiceModel =
  mongoose.models.medicalService ||
  mongoose.model("medicalService", medicalServiceSchema);

module.exports = medicalServiceModel;
