const express = require("express");
const authUser = require("../middlewares/authUser.js");
const {
  initiateAppointmentPayment,
  handlePaymobCallback,
  checkPaymentStatus,
  verifyPaymentWithPaymob,
} = require("../controllers/paymentController.js");

const router = express.Router();

// Initiate payment
router.post("/initiate", authUser, initiateAppointmentPayment);

// Paymob callback (no auth needed - called by Paymob)
router.post("/callback", handlePaymobCallback);

// Test callback endpoint (for debugging)
router.post("/test-callback", (req, res) => {
  console.log("=== TEST CALLBACK RECEIVED ===");
  console.log("Full request:", JSON.stringify(req.body, null, 2));
  res.json({
    success: true,
    message: "Test callback received",
    receivedData: req.body,
  });
});

// Check payment status (quick DB check)
router.get("/status/:appointmentId", authUser, checkPaymentStatus);

// Verify payment with Paymob API (authoritative check)
router.get("/verify/:appointmentId", authUser, verifyPaymentWithPaymob);

module.exports = router;
