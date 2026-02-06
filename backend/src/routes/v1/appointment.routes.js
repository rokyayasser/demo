const express = require("express");
const router = express.Router();

// Controllers
const sharedAppointmentController = require("../../controllers/shared/appointment.controller");

// Middlewares
const authUser = require("../../middlewares/auth/user.auth");
const {
  upload,
  checkUploadErrors,
} = require("../../middlewares/upload/multer.config");
const parseFormData = require("../../middlewares/upload/formDataParser");

// Public routes (no authentication required)
router.get("/medical-services", sharedAppointmentController.getAllServices);
router.get("/medical-services/:id", sharedAppointmentController.getServiceById);
router.get(
  "/available-slots/:date",
  sharedAppointmentController.getAvailableSlots
);
router.get("/check-slot", sharedAppointmentController.checkSlotAvailability);

// Protected routes (require user authentication)
// Book appointment - uses FormData for file uploads
router.post(
  "/",
  authUser,
  parseFormData, // Parse multipart/form-data
  (req, res, next) => {
    // Add file validation middleware
    upload.fields([
      { name: "medicationsFile", maxCount: 1 },
      { name: "testsFile", maxCount: 1 },
    ])(req, res, (err) => {
      if (err) {
        return checkUploadErrors(err, req, res, next);
      }
      next();
    });
  },
  sharedAppointmentController.bookAppointment
);
router.get("/booked-slots", sharedAppointmentController.getBookedSlots);

// User-specific appointment routes
router.get("/user", authUser, async (req, res) => {
  // This will be handled by user appointments controller
  const userAppointmentsController = require("../../controllers/user/appointments.controller");
  return userAppointmentsController.getUserAppointments(req, res);
});

router.post("/cancel", authUser, async (req, res) => {
  const userAppointmentsController = require("../../controllers/user/appointments.controller");
  return userAppointmentsController.cancelAppointment(req, res);
});

module.exports = router;
