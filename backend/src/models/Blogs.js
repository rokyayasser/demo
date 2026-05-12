// src/models/Blog.js
"use strict";
const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String, default: "" },
    category: { type: String, default: "صحة عامة" },
    youtubeId: { type: String, default: "" },
    meta1: { type: String, default: "" }, // date label e.g. "3 يناير 2025"
    meta2: { type: String, default: "5 دقائق قراءة" },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.models.Blog || mongoose.model("Blog", blogSchema);
