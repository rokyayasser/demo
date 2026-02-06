const express = require("express");

// Import from adminController
const adminController = require("../controllers/adminController.js");

// Import from appointmentController
const appointmentController = require("../controllers/appointmentController.js");

// Import auth middleware
const authUser = require("../middlewares/authUser.js");

const router = express.Router();

// Public routes for medical services (no auth required)
router.get("/medical-services/list", adminController.allMedicalServices);
router.get("/medical-services/:category", adminController.getMedicalServicesByCategory);

// Appointment routes (now with authentication)
router.post("/appointments", authUser, appointmentController.bookAppointment);
router.get("/appointments/user", authUser, appointmentController.getUserAppointments);
router.post("/appointments/cancel", authUser, appointmentController.cancelAppointment);
router.post("/appointments/pay", authUser, appointmentController.payAppointment);

module.exports = router;