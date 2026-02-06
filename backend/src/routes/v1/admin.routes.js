const express = require("express");
const router = express.Router();

// Controllers
const adminAuthController = require("../../controllers/admin/auth.controller");
const adminServicesController = require("../../controllers/admin/services.controller");
const adminAppointmentsController = require("../../controllers/admin/appointments.controller");
const adminSlotsController = require("../../controllers/admin/slots.controller");

// Middlewares
const authAdmin = require("../../middlewares/auth/admin.auth");
const {
  upload,
  checkUploadErrors,
} = require("../../middlewares/upload/multer.config");

// Admin authentication
router.post("/login", adminAuthController.login);

// Medical Services routes (protected)
router.post(
  "/services",
  authAdmin,
  upload.single("image"),
  checkUploadErrors,
  adminServicesController.addService
);

router.get("/services", authAdmin, adminServicesController.getAllServices);
router.get(
  "/services/:serviceId",
  authAdmin,
  adminServicesController.getServiceById
);
router.put(
  "/services/:serviceId",
  authAdmin,
  upload.single("image"),
  checkUploadErrors,
  adminServicesController.updateService
);
router.delete(
  "/services/:serviceId",
  authAdmin,
  adminServicesController.deleteService
);
router.get(
  "/services/category/:category",
  authAdmin,
  adminServicesController.getServicesByCategory
);
router.post(
  "/services/availability",
  authAdmin,
  adminServicesController.changeAvailability
);

// Appointments management (protected)
router.get(
  "/appointments",
  authAdmin,
  adminAppointmentsController.getAllAppointments
);
router.post(
  "/appointments/status",
  authAdmin,
  adminAppointmentsController.updateAppointmentStatus
);

// Block/unblock time slots (protected)
router.post("/slots/block", authAdmin, adminSlotsController.blockTimeSlot);
router.post(
  "/slots/block-range",
  authAdmin,
  adminSlotsController.blockTimeSlotRange
);
router.delete(
  "/slots/unblock/:slotId",
  authAdmin,
  adminSlotsController.unblockTimeSlot
);
router.get("/slots/blocked", authAdmin, adminSlotsController.getBlockedSlots);

// Health check route (protected)
router.get("/health", authAdmin, (req, res) => {
  res.json({
    success: true,
    message: "Admin API is healthy",
    timestamp: new Date().toISOString(),
    admin: req.adminEmail,
  });
});

module.exports = router;
