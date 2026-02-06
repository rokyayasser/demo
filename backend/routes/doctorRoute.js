const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");
const authDoctor = require("../middlewares/authDoctor");
const downloadController = require("../controllers/downloadController");

// Download route - NO JSON PARSING
router.get("/download-file", downloadController.downloadFile);

// All other routes need JSON parsing
const jsonParser = express.json();

// Doctor login
router.post("/login", jsonParser, doctorController.loginDoctor);

// Doctor calendar and appointments
router.get(
  "/calendar",
  jsonParser,
  authDoctor,
  doctorController.getCalendarView
);
router.get(
  "/appointments/today",
  jsonParser,
  authDoctor,
  doctorController.getTodayAppointments
);
router.get(
  "/appointments/:id/details",
  jsonParser,
  authDoctor,
  doctorController.getAppointmentDetails
);
router.get(
  "/appointments/:date",
  jsonParser,
  authDoctor,
  doctorController.getAppointmentsByDate
);
router.get(
  "/appointments",
  jsonParser,
  authDoctor,
  doctorController.getDoctorAppointments
);
router.post(
  "/appointments/:id/status",
  jsonParser,
  authDoctor,
  doctorController.updateAppointmentStatus
);
router.get("/stats", jsonParser, authDoctor, doctorController.getDoctorStats);

module.exports = router;
