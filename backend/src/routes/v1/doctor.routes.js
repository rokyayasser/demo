const express = require("express");
const router = express.Router();

// Controllers
const doctorAuthController = require("../../controllers/doctor/auth.controller");
const doctorAppointmentsController = require("../../controllers/doctor/appointments.controller");
const doctorDashboardController = require("../../controllers/doctor/dashboard.controller");
const downloadController = require("../../controllers/shared/download.controller");

// Middlewares
const authDoctor = require("../../middlewares/auth/doctor.auth");

// Doctor login (public)
router.post("/login", doctorAuthController.login);

// Download route - NO authentication required (public access to files)
router.get("/download-file", downloadController.downloadFile);

// All other routes require doctor authentication
// Doctor calendar and dashboard
router.get("/calendar", authDoctor, doctorDashboardController.getCalendarView);
router.get("/stats", authDoctor, doctorDashboardController.getDoctorStats);

// Appointments management
router.get(
  "/appointments",
  authDoctor,
  doctorAppointmentsController.getDoctorAppointments
);
router.get(
  "/appointments/today",
  authDoctor,
  doctorAppointmentsController.getTodayAppointments
);
router.get(
  "/appointments/:id",
  authDoctor,
  doctorAppointmentsController.getAppointmentDetails
);
router.get(
  "/appointments/date/:date",
  authDoctor,
  doctorAppointmentsController.getAppointmentsByDate
);
router.put(
  "/appointments/:id/status",
  authDoctor,
  doctorAppointmentsController.updateAppointmentStatus
);

// Health check route
router.get("/health", authDoctor, (req, res) => {
  res.json({
    success: true,
    message: "Doctor API is healthy",
    timestamp: new Date().toISOString(),
    doctor: req.doctorEmail,
  });
});

module.exports = router;
