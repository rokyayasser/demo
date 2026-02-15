const express = require("express");
const router = express.Router();

// Controllers
const sharedAppointmentController = require("../../controllers/shared/appointment.controller");

// Middlewares
const authUser = require("../../middlewares/auth/user.auth");
const { upload } = require("../../middlewares/upload/multer.config");

// Public routes (no authentication required)
router.get("/medical-services", sharedAppointmentController.getAllServices);
router.get("/medical-services/:id", sharedAppointmentController.getServiceById);
router.get(
  "/available-slots/:date",
  sharedAppointmentController.getAvailableSlots,
);
router.get("/check-slot", sharedAppointmentController.checkSlotAvailability);
router.get("/booked-slots", sharedAppointmentController.getBookedSlots);

// Protected routes (require user authentication)
// Book appointment - uses FormData for file uploads
router.post(
  "/",
  authUser,
  (req, res, next) => {
    // Custom multer error handler
    const uploadMiddleware = upload.fields([
      { name: "medicationsFile", maxCount: 1 },
      { name: "testsFile", maxCount: 1 },
    ]);

    uploadMiddleware(req, res, (err) => {
      if (err) {
        console.error("❌ Multer error:", err);

        // Handle specific multer errors
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت",
            errorCode: "FILE_TOO_LARGE",
          });
        }

        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return res.status(400).json({
            success: false,
            message: "نوع الملف غير مدعوم",
            errorCode: "INVALID_FILE_TYPE",
          });
        }

        return res.status(500).json({
          success: false,
          message: err.message || "فشل رفع الملفات",
          errorCode: "UPLOAD_ERROR",
        });
      }

      // If no error, proceed to controller
      next();
    });
  },
  sharedAppointmentController.bookAppointment,
);

// User-specific appointment routes
router.get("/user", authUser, async (req, res) => {
  const userAppointmentsController = require("../../controllers/user/appointments.controller");
  return userAppointmentsController.getUserAppointments(req, res);
});

router.post("/cancel", authUser, async (req, res) => {
  const userAppointmentsController = require("../../controllers/user/appointments.controller");
  return userAppointmentsController.cancelAppointment(req, res);
});

module.exports = router;
