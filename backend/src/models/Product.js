"use strict";
// src/models/Product.js  — replace existing file entirely
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    title_ar: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    description_ar: { type: String, trim: true, default: "" },
    category: { type: String, trim: true, default: "" },
    image: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },

    // Truly optional — undefined when not set, never stored as null or ""
    discountPrice: {
      type: Number,
      min: 0,
    },

    stock: { type: Number, default: 0, min: 0 },
    available: { type: Boolean, default: true, index: true },
    featured: { type: Boolean, default: false },
    tags: [{ type: String }],

    // Flat counters — avoids the nested meta:{} object crash
    views: { type: Number, default: 0 },
    sales: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

productSchema.index({ category: 1, available: 1 });
productSchema.index({ title: "text", title_ar: "text" });
productSchema.index({ createdAt: -1 });

module.exports =
  mongoose.models.Product || mongoose.model("Product", productSchema);
