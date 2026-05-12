// routes/v1/doctor.routes.js
"use strict";
const express = require("express");
const router = express.Router();
const c = require("../../controllers/doctor/doctor.controller");
const doctorAuth = require("../../controllers/doctor/doctor.auth.controller");
const authDoctor = require("../../middlewares/auth/doctor.auth");

// ── PUBLIC: login ───────────────────────────────────────────────────────────
router.post("/login", doctorAuth.login);

// ── All routes below require doctor authentication ───────────────────────────
router.use(authDoctor);

// ── Appointments – static paths FIRST (before /:id) ───────────────────────────
router.get("/appointments/today", c.getTodayAppointments);
router.get("/appointments/date/:date", c.getAppointmentsByDate);
router.get("/appointments", c.getAppointments);
router.get("/appointments/:id", c.getAppointmentDetails);
router.put("/appointments/:id/status", c.updateAppointmentStatus);

// ── Calendar & stats ─────────────────────────────────────────────────────────
router.get("/calendar", c.getCalendarView);
router.get("/stats", c.getStats);

// ── Debug endpoint (optional) ────────────────────────────────────────────────
router.get("/debug/dates", c.debugDateFormats);

module.exports = router;
