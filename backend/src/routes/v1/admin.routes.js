// routes/v1/admin.routes.js
"use strict";
const express = require("express");
const router = express.Router();
const authAdmin = require("../../middlewares/auth/admin.auth");
const adminAuth = require("../../controllers/admin/admin.auth.controller");
const admin = require("../../controllers/admin/admin.controller");

// Try to load MedicalService model — used for service CRUD
let MedicalService;
try {
  MedicalService = require("../../models/MedicalService");
} catch (e) {
  try {
    MedicalService = require("../../models/Service");
  } catch (e2) {
    console.warn(
      "MedicalService model not found — /admin/services CRUD will use inline handler",
    );
  }
}

// BlockedSlot model — loaded at module level so all route handlers can use it
let BlockedSlotModel;
try {
  BlockedSlotModel = require("../../models/Blockedslot");
} catch (e) {
  console.warn(
    "admin.routes: BlockedSlot not found at require time:",
    e.message,
  );
}

// Try multer for image uploads
let upload;
try {
  ({ upload } = require("../../middlewares/upload/multer.config"));
} catch (e) {
  upload = { single: () => (req, res, next) => next() };
}

// Try cloudinary
let cloudinary;
try {
  cloudinary = require("../../config/cloudinary");
} catch (e) {}

// ── Public: login + forgot/reset password ─────────────────────────────────────
router.post("/login", adminAuth.login);
router.post("/forgot-password", adminAuth.forgotPassword);
router.post("/verify-otp", adminAuth.verifyOtp);
router.post("/reset-password", adminAuth.resetPassword);

// ── All routes below require admin JWT ────────────────────────────────────────
router.use(authAdmin);

// ── Admin profile ──────────────────────────────────────────────────────────────
router.get("/me", adminAuth.getMe);
router.put("/me", adminAuth.updateProfile);
router.put("/me/password", adminAuth.changeOwnPassword);

// ── Admin management (superadmin only) ────────────────────────────────────────
// Middleware: block non-superadmin access
const superadminOnly = (req, res, next) => {
  if (req.adminRole !== "superadmin") {
    return res.status(403).json({
      success: false,
      message: "هذه العملية متاحة للسوبر أدمن فقط",
    });
  }
  next();
};

router.get("/admins", superadminOnly, adminAuth.list);
router.post("/admins", superadminOnly, adminAuth.create);
router.delete("/admins/:id", superadminOnly, adminAuth.remove);
router.put("/admins/:id/password", superadminOnly, adminAuth.changePassword);

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get("/dashboard/stats", admin.getDashboardStats);

// ── Users (read-only) ─────────────────────────────────────────────────────────
router.get("/users", admin.getUsers);

// ── Appointments ──────────────────────────────────────────────────────────────
router.get("/appointments", admin.getAppointments);
router.post("/appointments/status", admin.updateAppointmentStatus);

// ── Blocked slots ─────────────────────────────────────────────────────────────
router.get("/slots/blocked", admin.getBlockedSlots);
router.delete("/slots/unblock/:id", admin.unblockSlot);

// Slot block — handles both single {date,time} and range {startDate,endDate,startTime,endTime}
router.post("/slots/block", async (req, res) => {
  try {
    // Normalize: BlockSlots.jsx may send { date: {startDate,endDate,...}, reason }
    // OR flat { startDate, endDate, startTime, endTime, reason }
    let body = req.body;
    if (body.date && typeof body.date === "object" && body.date.startDate) {
      // Unwrap the nested date object
      body = { ...body.date, reason: body.reason || body.date.reason || "" };
    }

    // Shape A — range: { startDate, endDate, startTime, endTime, reason }
    if (body.startDate) {
      const { startDate, endDate, startTime, endTime, reason = "" } = body;

      // Generate all dates in range
      const dates = [];
      const start = new Date(startDate);
      const end = new Date(endDate || startDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(d.toISOString().split("T")[0]);
      }

      // All 30-min slots from 10am to 9pm in Arabic format
      const allTimes = [];
      for (let h = 10; h < 21; h++) {
        for (let m = 0; m < 60; m += 30) {
          const t = new Date();
          t.setHours(h, m, 0, 0);
          allTimes.push(
            t
              .toLocaleTimeString("ar-EG", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
              .replace("AM", "ص")
              .replace("PM", "م"),
          );
        }
      }

      // Filter times to the requested range
      let times = allTimes;
      if (startTime && endTime) {
        const si = allTimes.indexOf(startTime);
        const ei = allTimes.indexOf(endTime);
        if (si !== -1 && ei !== -1) times = allTimes.slice(si, ei + 1);
      } else if (startTime) {
        const si = allTimes.indexOf(startTime);
        if (si !== -1) times = allTimes.slice(si);
      }

      // Use module-level BlockedSlotModel, fall back to mongoose.models if needed
      const mongoose = require("mongoose");
      const BlockedSlot =
        BlockedSlotModel || mongoose.models.BlockedSlot || null;
      console.log(
        `Bulk block: using ${BlockedSlot ? "BlockedSlot collection" : "Appointment fallback"}`,
      );

      let count = 0;
      for (const date of dates) {
        for (const time of times) {
          try {
            if (BlockedSlot) {
              await BlockedSlot.create({
                date,
                time,
                reason: reason || "",
                blockedBy: "admin",
              });
            } else {
              // Fallback with Appointment — fill all required fields
              const Appointment = require("../../models/Appointment");
              const exists = await Appointment.findOne({
                date,
                time,
                isBlocked: true,
              });
              if (!exists) {
                const anyService = await require("../../models/MedicalService")
                  .findOne()
                  .lean()
                  .catch(() => null);
                const anyUser = await require("../../models/User")
                  .findOne()
                  .lean()
                  .catch(() => null);
                await new Appointment({
                  date,
                  dateISO: date,
                  time,
                  status: "confirmed",
                  isBlocked: true,
                  notes: reason || "Blocked by admin",
                  blockedBy: "admin",
                  firstName: "blocked",
                  lastName: "slot",
                  email: "blocked@system.com",
                  phone: "0000000000",
                  amount: 0,
                  category: anyService?.category || "blocked",
                  serviceId: anyService?._id,
                  userId: anyUser?._id,
                }).save();
              }
            }
            count++;
          } catch (e) {
            if (e.code !== 11000)
              console.error(`blockSlot ${date} ${time}:`, e.message);
            // 11000 = duplicate key (already blocked) — skip silently
          }
        }
      }

      return res.json({
        success: true,
        message: `تم حظر ${count} موعد بنجاح`,
        data: { blockedCount: count },
      });
    }

    // Shape B — single slot: { date, time, reason }
    return admin.blockSlot(req, res);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ── Services CRUD ─────────────────────────────────────────────────────────────
// These routes mirror /api/v1/appointments/medical-services but are admin-only
// and support POST/PUT/DELETE

router.get("/services", async (req, res) => {
  try {
    if (!MedicalService)
      return res.json({ success: true, data: { services: [] } });
    const services = await MedicalService.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: { services } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/services", upload.single("image"), async (req, res) => {
  try {
    if (!MedicalService)
      return res
        .status(503)
        .json({ success: false, message: "Service model not available" });
    const body = req.body;

    let imageUrl = "";
    if (req.file && cloudinary) {
      const result = await cloudinary.uploadImage(req.file.buffer, "services");
      imageUrl = result.secure_url;
    }

    let features = body.features;
    if (typeof features === "string") {
      try {
        features = JSON.parse(features);
      } catch {
        features = features
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }

    const service = new MedicalService({
      title: body.title || "",
      title_ar: body.title_ar || "",
      category: body.category || "",
      category_ar: body.category_ar || "",
      description: body.description || "",
      fees: Number(body.fees) || 0,
      duration: body.duration || "30 دقيقة",
      features: features || [],
      available: body.available !== "false",
      image: imageUrl,
    });
    await service.save();
    return res.json({
      success: true,
      data: { service },
      message: "تم إضافة الخدمة",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/services/:id", upload.single("image"), async (req, res) => {
  try {
    if (!MedicalService)
      return res
        .status(503)
        .json({ success: false, message: "Service model not available" });
    const body = req.body;
    const updates = {};

    [
      "title",
      "title_ar",
      "category",
      "category_ar",
      "description",
      "duration",
    ].forEach((k) => {
      if (body[k] !== undefined) updates[k] = body[k];
    });

    if (body.fees !== undefined) updates.fees = Number(body.fees) || 0;
    if (body.available !== undefined)
      updates.available = body.available !== "false";

    if (body.features !== undefined) {
      let f = body.features;
      if (typeof f === "string") {
        try {
          f = JSON.parse(f);
        } catch {
          f = f
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
      }
      updates.features = f;
    }

    if (req.file && cloudinary) {
      const result = await cloudinary.uploadImage(req.file.buffer, "services");
      updates.image = result.secure_url;
    }

    const service = await MedicalService.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true },
    );
    if (!service)
      return res
        .status(404)
        .json({ success: false, message: "الخدمة غير موجودة" });
    return res.json({
      success: true,
      data: { service },
      message: "تم تحديث الخدمة",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/services/:id", async (req, res) => {
  try {
    if (!MedicalService)
      return res
        .status(503)
        .json({ success: false, message: "Service model not available" });
    await MedicalService.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "تم حذف الخدمة" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.patch("/services/:id/toggle", async (req, res) => {
  try {
    if (!MedicalService)
      return res
        .status(503)
        .json({ success: false, message: "Service model not available" });
    const service = await MedicalService.findById(req.params.id);
    if (!service)
      return res
        .status(404)
        .json({ success: false, message: "الخدمة غير موجودة" });
    service.available = !service.available;
    await service.save();
    return res.json({
      success: true,
      data: { service },
      message: "تم تغيير حالة الخدمة",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
