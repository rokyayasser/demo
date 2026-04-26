"use strict";
// src/models/Course.js  — replace existing file entirely
const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    title_ar: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    description_ar: { type: String, trim: true, default: "" },
    category: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
    price: { type: Number, required: true, min: 0, default: 0 },
    duration: { type: String, default: "10 ساعات" },
    totalLessons: { type: Number, default: 0 },
    instructor: { type: String, default: "د. أحمد الخطيب" },

    // ── Plain string arrays (NOT subdocuments) ────────────────────────────────
    // features was [{text,iconName}] which caused "Cast to embedded" errors
    // when the frontend sends plain strings. Now stored as [String].
    tags: [{ type: String }],
    features: [{ type: String }],
    timeline: [{ type: String }],

    note: { type: String, default: "" },
    available: { type: Boolean, default: true, index: true },

    // YouTube unlisted playlist — select:false keeps it out of public API responses
    playlistUrl: { type: String, default: "", select: false },

    // Flat counters — avoid the nested meta:{} object that caused
    // "Cannot create field 'views' in element {meta:'[object Object]'}"
    views: { type: Number, default: 0 },
    enrollments: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

courseSchema.index({ category: 1, available: 1 });
courseSchema.index({ title: "text", title_ar: "text", description: "text" });
courseSchema.index({ createdAt: -1 });

module.exports =
  mongoose.models.Course || mongoose.model("Course", courseSchema);
