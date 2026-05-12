const express = require("express");
const router = express.Router();

// Controllers
const sharedAppointmentController = require("../../controllers/shared/appointment.controller");

// Middlewares
const authUser = require("../../middlewares/auth/user.auth");
const { upload } = require("../../middlewares/upload/multer.config");
const Appointment = require("../../models/Appointment");

// GET /api/v1/appointments/my-appointments
// Returns all appointments for the logged-in user
router.get("/my-appointments", authUser, async (req, res) => {
  try {
    const appointments = await Appointment.find({
      userId: req.userId,
      status: { $ne: "blocked" },
    })
      .populate("serviceId", "title title_ar category_ar fees duration image")
      .sort({ createdAt: -1 })
      .lean();

    const mapped = appointments.map((a) => ({
      ...a,
      service: a.serviceId || null,
    }));

    return res.json({ success: true, data: { appointments: mapped } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

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
      { name: "medicationsFile", maxCount: 1 }, // single prescription file
      { name: "testsFile", maxCount: 10 }, // up to 10 medical test files
    ]);

    uploadMiddleware(req, res, (err) => {
      if (err) {
        console.error("❌ Multer error:", err);

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

      // No error — proceed to controller
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

// ── Confirm appointment payment (called by PaymentCallback after Paymob redirect) ──
// Paymob merchant_order_id format: "{appointmentId}_{timestamp}"
router.post("/confirm-payment", async (req, res) => {
  try {
    const { merchantOrderId, transactionId } = req.body;
    if (!merchantOrderId) {
      return res
        .status(400)
        .json({ success: false, message: "merchantOrderId مطلوب" });
    }

    // Extract appointmentId — merchant_order_id is "{appointmentId}_{timestamp}"
    const appointmentId = merchantOrderId.split("_")[0];
    if (!appointmentId || appointmentId.length !== 24) {
      return res
        .status(400)
        .json({ success: false, message: "merchantOrderId غير صالح" });
    }

    const Appointment = require("../../models/Appointment");
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "الموعد غير موجود" });
    }

    // Already paid — idempotent
    if (appointment.paid) {
      return res.json({ success: true, alreadyPaid: true, appointment });
    }

    // Mark as paid + confirmed
    appointment.paid = true;
    appointment.status = "confirmed";
    appointment.paymobTransactionId = String(transactionId || "");
    appointment.paymentDate = new Date();
    await appointment.save();

    console.log("✅ Appointment payment confirmed:", appointment._id);

    // Send confirmation email if email service available
    try {
      const {
        sendAppointmentConfirmationEmail,
      } = require("../../services/email.service");
      if (sendAppointmentConfirmationEmail) {
        await sendAppointmentConfirmationEmail({
          toEmail: appointment.email,
          patientName:
            `${appointment.firstName} ${appointment.lastName}`.trim(),
          date: appointment.date,
          time: appointment.time,
          service: appointment.category,
        });
      }
    } catch (emailErr) {
      console.warn("Email send error:", emailErr.message);
    }

    return res.json({ success: true, appointment });
  } catch (err) {
    console.error("confirm-appointment-payment:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
