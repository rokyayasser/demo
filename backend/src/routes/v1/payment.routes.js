const express = require("express");
const router = express.Router();

// Controllers
const sharedPaymentController = require("../../controllers/shared/payment.controller");

// Middlewares
const authUser = require("../../middlewares/auth/user.auth");

// Initiate payment (requires user authentication)
router.post("/initiate", authUser, sharedPaymentController.initiatePayment);

// Paymob callback (no auth needed - called by Paymob)
router.post("/callback", sharedPaymentController.handleCallback);

// Test callback endpoint (for debugging)
router.post("/test-callback", (req, res) => {
  console.log("=== TEST CALLBACK RECEIVED ===");
  console.log("Request body:", JSON.stringify(req.body, null, 2));
  res.json({
    success: true,
    message: "Test callback received",
    receivedData: req.body,
  });
});

// Check payment status (requires user authentication)
router.get(
  "/status/:appointmentId",
  authUser,
  sharedPaymentController.checkPaymentStatus
);

// Verify payment with Paymob API (requires user authentication)
router.get(
  "/verify/:appointmentId",
  authUser,
  sharedPaymentController.verifyPayment
);

module.exports = router;
