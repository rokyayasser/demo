const axios = require("axios");
const { initiatePayment, verifyCallback } = require("../src/config/paymob.js");
const appointmentModel = require("../models/appointmentModel.js");
const userModel = require("../models/userModel.js");

// Initiate payment
const initiateAppointmentPayment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const userId = req.userId;

    // Get appointment
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    // Check if already paid
    if (appointment.paid) {
      return res.json({ success: false, message: "Appointment already paid" });
    }

    // Verify appointment belongs to user
    if (appointment.userId.toString() !== userId) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    // Get user info
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const userInfo = {
      name: user.name,
      email: user.email,
      phone: user.phone || "01000000000",
    };

    // Initiate payment with Paymob
    const paymentData = await initiatePayment(
      appointmentId,
      appointment.amount,
      userInfo
    );

    // Store payment info in appointment
    appointment.paymobOrderId = paymentData.orderId;
    appointment.paymobMerchantOrderId = paymentData.merchantOrderId;
    appointment.paymentInitiatedAt = new Date();
    await appointment.save();

    res.json({
      success: true,
      message: "Payment initiated successfully",
      paymentUrl: paymentData.iframeUrl,
      paymentKey: paymentData.paymentKey,
    });
  } catch (error) {
    console.error("Payment Initiation Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to initiate payment",
    });
  }
};

// Handle Paymob callback - IMPROVED WITH DEBUG LOGGING
const handlePaymobCallback = async (req, res) => {
  try {
    console.log("=== PAYMOB CALLBACK RECEIVED ===");
    console.log("Request Method:", req.method);
    console.log("Request Headers:", JSON.stringify(req.headers, null, 2));
    console.log("Full Request Body:", JSON.stringify(req.body, null, 2));
    console.log("Query Parameters:", JSON.stringify(req.query, null, 2));

    const callbackData = req.body.obj || req.body;
    const receivedHmac = req.query.hmac;

    if (!callbackData) {
      console.error("No callback data received!");
      return res.status(400).json({
        success: false,
        message: "No callback data received",
      });
    }

    console.log("=== CALLBACK DATA PARSED ===");
    console.log("Callback Data Type:", typeof callbackData);
    console.log("Callback Data:", JSON.stringify(callbackData, null, 2));
    console.log("Received HMAC:", receivedHmac);

    // If no HMAC in test environment, accept it (for debugging)
    if (process.env.NODE_ENV === "development" && !receivedHmac) {
      console.log("⚠️ DEVELOPMENT MODE: Skipping HMAC verification");
    } else {
      // Verify HMAC
      const hmacValid = verifyCallback(callbackData, receivedHmac);
      console.log("HMAC Verification Result:", hmacValid);

      if (!hmacValid) {
        console.error("HMAC verification failed!");
        console.log(
          "Expected HMAC Secret:",
          process.env.PAYMOB_HMAC_SECRET ? "Set" : "Not Set"
        );
        return res.status(400).json({
          success: false,
          message: "Invalid callback signature",
        });
      }
    }

    // Extract appointment ID from merchant_order_id (format: appointmentId_timestamp)
    const merchantOrderId = callbackData.order?.merchant_order_id;
    if (!merchantOrderId) {
      console.error("No merchant_order_id in callback data!");
      return res.status(400).json({
        success: false,
        message: "Invalid callback data: missing merchant_order_id",
      });
    }

    const appointmentId = merchantOrderId.split("_")[0];
    const success =
      callbackData.success === true || callbackData.success === "true";

    console.log("Extracted Appointment ID:", appointmentId);
    console.log("Payment Success:", success);
    console.log("Order ID:", callbackData.order?.id);
    console.log("Transaction ID:", callbackData.id);

    // Find appointment
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      console.error("Appointment not found:", appointmentId);
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    console.log("Appointment Found:", appointment._id);
    console.log("Current Paid Status:", appointment.paid);
    console.log("Current Status:", appointment.status);

    if (success) {
      // Payment successful
      appointment.paid = true;
      appointment.status = "confirmed";
      appointment.paymobTransactionId = callbackData.id;
      appointment.paymentDate = new Date();

      // Add payment method if available
      if (callbackData.source_data?.type) {
        appointment.paymentMethod = callbackData.source_data.type;
      }

      await appointment.save();

      console.log("✅ Appointment updated successfully!");
      console.log("New Paid Status:", appointment.paid);
      console.log("New Status:", appointment.status);
      console.log(`✅ Payment successful for appointment: ${appointmentId}`);

      // Send success response to Paymob
      return res.json({
        success: true,
        message: "Payment processed successfully",
      });
    } else {
      // Payment failed
      console.log(`❌ Payment failed for appointment: ${appointmentId}`);
      appointment.paymentAttempts = (appointment.paymentAttempts || 0) + 1;
      appointment.lastPaymentError = "Payment failed in Paymob callback";
      await appointment.save();

      return res.json({
        success: true,
        message: "Payment failure recorded",
      });
    }
  } catch (error) {
    console.error("Callback Error:", error);
    console.error("Error Stack:", error.stack);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Check payment status (quick database check)
const checkPaymentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.userId;

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.json({
        success: false,
        message: "Appointment not found",
        paid: false,
      });
    }

    // Verify appointment belongs to user
    if (appointment.userId.toString() !== userId) {
      return res.json({
        success: false,
        message: "Unauthorized",
        paid: false,
      });
    }

    res.json({
      success: true,
      paid: appointment.paid,
      status: appointment.status,
      transactionId: appointment.paymobTransactionId,
      message: appointment.paid ? "Payment confirmed" : "Payment pending",
    });
  } catch (error) {
    console.error("Check Payment Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      paid: false,
    });
  }
};

// Verify payment directly with Paymob API
const verifyPaymentWithPaymob = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.userId;

    console.log("=== VERIFYING PAYMENT WITH PAYMOB ===");
    console.log("Appointment ID:", appointmentId);

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    // Verify appointment belongs to user
    if (appointment.userId.toString() !== userId) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    // If already paid in our database, return success
    if (appointment.paid) {
      console.log("✅ Already marked as paid in database");
      return res.json({
        success: true,
        paid: true,
        status: appointment.status,
        message: "Payment already confirmed",
      });
    }

    // Check with Paymob if we have an order ID
    if (appointment.paymobOrderId) {
      try {
        console.log("Fetching order from Paymob:", appointment.paymobOrderId);

        // Import getAuthToken from paymob config
        const { getAuthToken } = require("../src/config/paymob.js");
        const authToken = await getAuthToken();

        // Query Paymob for order status - FIXED API CALL
        const response = await axios.get(
          `https://accept.paymob.com/api/ecommerce/orders/${appointment.paymobOrderId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        const order = response.data;
        console.log("Paymob Order Status:", JSON.stringify(order, null, 2));
        console.log("Paid Amount (cents):", order.paid_amount_cents);
        console.log("Expected Amount (cents):", appointment.amount * 100);
        console.log("Order Transactions:", order.transactions?.length || 0);

        // Check if order is paid
        if (order.paid_amount_cents >= appointment.amount * 100) {
          // Update appointment
          appointment.paid = true;
          appointment.status = "confirmed";
          appointment.paymentDate = new Date();

          // Try to get transaction ID from order
          if (order.transactions && order.transactions.length > 0) {
            const successfulTxn = order.transactions.find(
              (t) => t.success === true
            );
            if (successfulTxn) {
              appointment.paymobTransactionId = successfulTxn.id;
              console.log("Found transaction ID:", successfulTxn.id);
            }
          }

          await appointment.save();

          console.log("✅ Payment verified and confirmed via Paymob API!");

          return res.json({
            success: true,
            paid: true,
            status: "confirmed",
            message: "Payment confirmed via Paymob verification",
          });
        } else {
          console.log("⏳ Payment not yet captured in Paymob");
          console.log("Order Status in Paymob:", order.status);
        }
      } catch (error) {
        console.error(
          "❌ Paymob verification error:",
          error.response?.data || error.message
        );
        console.error(
          "Error details:",
          error.response?.status,
          error.response?.statusText
        );
      }
    } else {
      console.log("⚠️ No Paymob order ID found in appointment");
    }

    // Return current status from database
    res.json({
      success: true,
      paid: appointment.paid,
      status: appointment.status,
      message: "Payment not confirmed yet",
    });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  initiateAppointmentPayment,
  handlePaymobCallback,
  checkPaymentStatus,
  verifyPaymentWithPaymob,
};
