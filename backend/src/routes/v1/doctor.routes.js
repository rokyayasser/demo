// routes/v1/doctor.routes.js
"use strict";
const express = require("express");
const router = express.Router();
const c = require("../../controllers/doctor/doctor.controller");
const doctorAuth = require("../../controllers/doctor/doctor.auth.controller");
const authDoctor = require("../../middlewares/auth/doctor.auth");

// ── PUBLIC: login (NO auth middleware) ───────────────────────────────────────
// Must be defined BEFORE router.use(authDoctor) otherwise the middleware
// intercepts the request and returns 401 before the handler runs.
router.post("/login", doctorAuth.login);

// ── All routes below this line require a valid doctor JWT ────────────────────
router.use(authDoctor);

// ── Appointments ──────────────────────────────────────────────────────────────
// Static paths BEFORE dynamic /:id — otherwise Express matches "today" as :id
router.get("/appointments/today", c.getTodayAppointments);
router.get("/appointments/date/:date", c.getAppointmentsByDate);
router.get("/appointments/:id/details", c.getAppointmentDetails);
router.get("/appointments", c.getAppointments);
router.put("/appointments/:id/status", c.updateAppointmentStatus);

// ── Calendar ──────────────────────────────────────────────────────────────────
router.get("/calendar", c.getCalendarView);

// ── Stats ─────────────────────────────────────────────────────────────────────
router.get("/stats", c.getStats);

// ── Debug: see actual date format stored in DB ────────────────────────────────
// GET /api/v1/doctor/debug/dates  — returns 5 sample appointments with their raw date field
// Remove after confirming date format.
router.get("/debug/dates", c.debugDateFormats);

module.exports = router;
