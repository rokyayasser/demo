const express = require("express");
const router = express.Router();

// Controllers
const userAuthController = require("../../controllers/user/auth.controller");
const userProfileController = require("../../controllers/user/profile.controller");
const userAppointmentsController = require("../../controllers/user/appointments.controller");

// Middlewares
const authUser = require("../../middlewares/auth/user.auth");
const {
  upload,
  checkUploadErrors,
} = require("../../middlewares/upload/multer.config");

// Forgot password — public routes
router.post("/forgot-password", userAuthController.forgotPassword);
router.post("/verify-otp", userAuthController.verifyOtp);
router.post("/reset-password", userAuthController.resetPassword);

// Authentication routes
router.post("/register", userAuthController.register);
router.post("/login", userAuthController.login);

// Profile routes (protected)
router.get("/profile", authUser, userProfileController.getProfile);
router.post(
  "/profile",
  authUser,
  upload.single("image"),
  checkUploadErrors,
  userProfileController.updateProfile,
);

// Appointment routes (protected)
router.get(
  "/appointments",
  authUser,
  userAppointmentsController.getUserAppointments,
);
router.post(
  "/appointments/cancel",
  authUser,
  userAppointmentsController.cancelAppointment,
);

module.exports = router;
