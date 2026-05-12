// src/routes/v1/blog.routes.js
"use strict";
const express = require("express");
const router = express.Router();
const Blog = require("../../models/Blogs");
const adminAuth = require("../../middlewares/auth/admin.auth");

let cloudinary;
try {
  cloudinary = require("../../config/cloudinary");
} catch (e) {
  console.warn("Cloudinary not loaded:", e.message);
}

let upload;
let uploadSingle = (req, res, next) => next(); // fallback
try {
  const multerConfig = require("../../middlewares/upload/multer.config");
  upload = multerConfig.upload;
  uploadSingle = upload.single("image");
  console.log("✅ Multer loaded for blog routes");
} catch (e) {
  console.error("❌ Failed to load multer config:", e.message);
}

// ── PUBLIC ────────────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { category, limit = 50, page = 1 } = req.query;
    const query = { published: true };
    if (category && category !== "الكل") query.category = category;
    const skip = (Number(page) - 1) * Number(limit);
    const [blogs, total] = await Promise.all([
      Blog.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Blog.countDocuments(query),
    ]);
    return res.json({ success: true, data: { blogs, total } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog)
      return res
        .status(404)
        .json({ success: false, message: "المقال غير موجود" });
    return res.json({ success: true, data: { blog } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ── ADMIN ─────────────────────────────────────────────────────────────────────

// CREATE
router.post("/", adminAuth, uploadSingle, async (req, res) => {
  try {
    let imageUrl = "";

    // File upload
    if (req.file) {
      try {
        let uploadedUrl = null;
        if (cloudinary?.uploadImage) {
          const r = await cloudinary.uploadImage(req.file.buffer, "blogs");
          uploadedUrl = r?.secure_url || r?.url || null;
        }
        if (!uploadedUrl) {
          const cloudinarySDK = require("cloudinary").v2;
          uploadedUrl = await new Promise((resolve, reject) => {
            const stream = cloudinarySDK.uploader.upload_stream(
              { folder: "blogs", resource_type: "image" },
              (err, result) =>
                err ? reject(err) : resolve(result?.secure_url),
            );
            stream.end(req.file.buffer);
          });
        }
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
          console.log("✅ Blog image uploaded:", imageUrl);
        }
      } catch (uploadErr) {
        console.error("❌ Blog image upload error:", uploadErr.message);
      }
    } else if (
      req.body.image &&
      typeof req.body.image === "string" &&
      req.body.image.trim()
    ) {
      imageUrl = req.body.image.trim();
    }

    const blog = new Blog({
      title: req.body.title,
      content: req.body.content,
      image: imageUrl,
      category: req.body.category || "صحة عامة",
      youtubeId: req.body.youtubeId || "",
      meta1:
        req.body.meta1 ||
        new Date().toLocaleDateString("ar-EG", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      meta2: req.body.meta2 || "5 دقائق قراءة",
      published: req.body.published !== "false" && req.body.published !== false,
      order: Number(req.body.order) || 0,
    });
    await blog.save();
    return res
      .status(201)
      .json({ success: true, data: { blog }, message: "تم إنشاء المقال" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// UPDATE – preserves image unless a new file is uploaded
router.put("/:id", adminAuth, uploadSingle, async (req, res) => {
  console.log(
    "PUT /blogs/:id – req.file:",
    req.file ? "FILE RECEIVED" : "NO FILE",
  );
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "المقال غير موجود" });
    }

    const updates = {};
    const allowedFields = [
      "title",
      "content",
      "category",
      "youtubeId",
      "meta1",
      "meta2",
      "published",
      "order",
    ];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === "published") {
          updates[field] =
            req.body[field] !== "false" && req.body[field] !== false;
        } else if (field === "order") {
          updates[field] = Number(req.body.order) || 0;
        } else {
          updates[field] = req.body[field];
        }
      }
    }

    // Only update image if a new file is uploaded – ignore text `image` field
    if (req.file && cloudinary) {
      const uploaded = await cloudinary.uploadImage(req.file.buffer, "blogs");
      if (uploaded?.secure_url) {
        updates.image = uploaded.secure_url;
        console.log("✅ New blog image uploaded:", updates.image);
      }
    }

    const updated = await Blog.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true },
    );
    return res.json({
      success: true,
      data: { blog: updated },
      message: "تم التحديث",
    });
  } catch (err) {
    console.error("Blog update error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "تم حذف المقال" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// SEED (admin only)
router.post("/seed", adminAuth, async (req, res) => {
  try {
    const { blogs } = req.body;
    if (!Array.isArray(blogs) || !blogs.length) {
      return res
        .status(400)
        .json({ success: false, message: "أرسل مصفوفة blogs في الـ body" });
    }
    const inserted = await Blog.insertMany(
      blogs.map((b, i) => ({ ...b, order: i, published: true })),
      { ordered: false },
    );
    return res.json({
      success: true,
      message: `تم إضافة ${inserted.length} مقال`,
      count: inserted.length,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
