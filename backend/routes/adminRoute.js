const express = require("express");
const authAdmin = require("../middlewares/authAdmin.js");
const adminController = require("../controllers/adminController.js");
const { upload, checkUploadErrors } = require("../middlewares/multer.js");

const router = express.Router();

// Admin authentication
router.post("/login", adminController.loginAdmin);

// Medical Services routes
router.post(
  "/add-service",
  authAdmin,
  upload.single("image"),
  adminController.addMedicalService
);
router.get("/services", authAdmin, adminController.allMedicalServices);
router.get(
  "/service/:serviceId",
  authAdmin,
  adminController.getMedicalServiceById
);
router.post(
  "/add-service",
  authAdmin,
  upload.single("image"),
  checkUploadErrors,
  adminController.addMedicalService
);
router.put(
  "/edit-service/:serviceId", // Changed to PUT for editing
  authAdmin,
  upload.single("image"),
  checkUploadErrors,
  adminController.editMedicalService // New controller function
);
router.get(
  "/services/:category",
  authAdmin,
  adminController.getMedicalServicesByCategory
);
router.post(
  "/change-service-availability",
  authAdmin,
  adminController.changeServiceAvailability
);
router.delete(
  "/delete-service/:serviceId",
  authAdmin,
  adminController.deleteMedicalService
);

// Appointments management
router.get("/appointments", authAdmin, adminController.getAllAppointments);
router.post(
  "/update-appointment-status",
  authAdmin,
  adminController.updateAppointmentStatus
);

// Block/unblock time slots
// In adminRoutes.js
router.post("/block-slot", authAdmin, adminController.blockTimeSlot); // Single slot
router.post("/block-slot-range", authAdmin, adminController.blockTimeSlotRange); // Range
router.delete(
  "/unblock-slot/:slotId",
  authAdmin,
  adminController.unblockTimeSlot
);
router.get("/blocked-slots", authAdmin, adminController.getBlockedSlots);

// Health check route
router.get("/health", authAdmin, (req, res) => {
  res.json({
    success: true,
    message: "Admin API is healthy",
    timestamp: new Date().toISOString(),
    admin: req.adminEmail,
  });
});

module.exports = router;
