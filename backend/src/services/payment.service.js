const paymob = require("../config/paymob");
const Appointment = require("../models/Appointment");
const User = require("../models/User");

class PaymentService {
  constructor() {
    this.paymob = paymob;
  }

  async initiatePayment(appointmentId, userId) {
    try {
      console.log("💰 Payment Service - Initiating payment:", {
        appointmentId,
        userId,
      });

      // Get appointment
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        throw new Error("Appointment not found");
      }

      console.log("✅ Appointment found:", {
        id: appointment._id,
        amount: appointment.amount,
        paid: appointment.paid,
      });

      // Check if already paid
      if (appointment.paid) {
        throw new Error("Appointment already paid");
      }

      // Verify appointment belongs to user
      if (appointment.userId.toString() !== userId) {
        throw new Error("Unauthorized");
      }

      // Get user info
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      console.log("✅ User found:", {
        id: user._id,
        email: user.email,
        name: user.name,
      });

      // ✅ FIX: Prepare userInfo object with all required fields
      const userInfo = {
        name:
          user.name ||
          `${appointment.userInfo?.firstName || "Customer"} ${appointment.userInfo?.lastName || ""}`.trim(),
        email: user.email || appointment.email || "customer@example.com",
        phone: user.phone || appointment.phone || "01000000000",
      };

      console.log("📋 User info prepared:", userInfo);

      // Validate userInfo has required fields
      if (!userInfo.email || !userInfo.name) {
        throw new Error("Missing required user information (email or name)");
      }

      // ✅ FIX: Call paymob.initiatePayment with correct parameter order
      // The PaymobService expects: (paymentId, amount, userInfo, items)
      const paymentData = await this.paymob.initiatePayment(
        appointmentId, // paymentId
        appointment.amount, // amount
        userInfo, // userInfo object with name, email, phone
        [], // items (optional)
      );

      console.log("✅ Paymob payment initiated:", {
        orderId: paymentData.orderId,
        hasPaymentUrl: !!paymentData.paymentUrl,
      });

      // Store payment info in appointment
      appointment.paymobOrderId = paymentData.orderId;
      appointment.paymobMerchantOrderId = paymentData.merchantOrderId;
      appointment.paymentInitiatedAt = new Date();
      await appointment.save();

      console.log("✅ Appointment updated with payment info");

      return {
        success: true,
        message: "Payment initiated successfully",
        paymentUrl: paymentData.paymentUrl,
        paymentKey: paymentData.paymentKey,
        orderId: paymentData.orderId,
        iframeUrl: paymentData.iframeUrl, // Also include for backwards compatibility
      };
    } catch (error) {
      console.error("❌ Payment Service - Initiate Error:", {
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async handleCallback(callbackData, receivedHmac) {
    try {
      console.log("📥 Payment callback received:", {
        transactionId: callbackData.id,
        success: callbackData.success,
        orderId: callbackData.order?.id,
      });

      // Verify HMAC
      const hmacValid = this.paymob.verifyCallback(callbackData, receivedHmac);
      if (!hmacValid) {
        console.error("❌ Invalid HMAC signature");
        throw new Error("Invalid callback signature");
      }

      console.log("✅ HMAC verified");

      // Extract appointment ID from merchant_order_id
      const merchantOrderId = callbackData.order?.merchant_order_id;
      if (!merchantOrderId) {
        throw new Error("Invalid callback data: missing merchant_order_id");
      }

      const appointmentId = merchantOrderId.split("_")[0];
      const success =
        callbackData.success === true || callbackData.success === "true";

      console.log("🔍 Processing payment for appointment:", appointmentId);

      // Find appointment
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        throw new Error("Appointment not found");
      }

      if (success) {
        // Payment successful
        console.log("✅ Payment successful, updating appointment");

        appointment.paid = true;
        appointment.status = "confirmed";
        appointment.paymobTransactionId = callbackData.id;
        appointment.paymentDate = new Date();

        // Add payment method if available
        if (callbackData.source_data?.type) {
          appointment.paymentMethod = callbackData.source_data.type;
        }

        await appointment.save();

        console.log("✅ Appointment updated - paid: true");

        return {
          success: true,
          appointmentId,
          message: "Payment processed successfully",
        };
      } else {
        // Payment failed
        console.log("❌ Payment failed");

        appointment.paymentAttempts = (appointment.paymentAttempts || 0) + 1;
        appointment.lastPaymentError = "Payment failed in Paymob callback";
        await appointment.save();

        return {
          success: false,
          appointmentId,
          message: "Payment failed",
        };
      }
    } catch (error) {
      console.error("❌ Payment Service - Callback Error:", error);
      throw error;
    }
  }

  async checkPaymentStatus(appointmentId, userId) {
    try {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        throw new Error("Appointment not found");
      }

      // Verify appointment belongs to user
      if (appointment.userId.toString() !== userId) {
        throw new Error("Unauthorized");
      }

      return {
        paid: appointment.paid,
        status: appointment.status,
        transactionId: appointment.paymobTransactionId,
        paymentMethod: appointment.paymentMethod,
        paymentDate: appointment.paymentDate,
      };
    } catch (error) {
      console.error("Payment Service - Check Status Error:", error);
      throw error;
    }
  }

  async verifyPaymentWithPaymob(appointmentId, userId) {
    try {
      console.log("🔍 Verifying payment with Paymob:", appointmentId);

      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        throw new Error("Appointment not found");
      }

      // Verify appointment belongs to user
      if (appointment.userId.toString() !== userId) {
        throw new Error("Unauthorized");
      }

      // If already paid in our database, return success
      if (appointment.paid) {
        console.log("✅ Already marked as paid in database");
        return {
          paid: true,
          status: appointment.status,
          message: "Payment already confirmed",
        };
      }

      // Check with Paymob if we have an order ID
      if (appointment.paymobOrderId) {
        try {
          console.log(
            "🔍 Checking order status with Paymob:",
            appointment.paymobOrderId,
          );

          const order = await this.paymob.getOrderStatus(
            appointment.paymobOrderId,
          );

          console.log("📊 Paymob order status:", {
            id: order.id,
            paid_amount: order.paid_amount_cents,
            expected_amount: appointment.amount * 100,
          });

          // Check if order is paid
          if (order.paid_amount_cents >= appointment.amount * 100) {
            // Update appointment
            appointment.paid = true;
            appointment.status = "confirmed";
            appointment.paymentDate = new Date();

            // Try to get transaction ID from order
            if (order.transactions && order.transactions.length > 0) {
              const successfulTxn = order.transactions.find(
                (t) => t.success === true,
              );
              if (successfulTxn) {
                appointment.paymobTransactionId = successfulTxn.id;
              }
            }

            await appointment.save();

            console.log("✅ Payment confirmed via Paymob verification");

            return {
              paid: true,
              status: "confirmed",
              message: "Payment confirmed via Paymob verification",
            };
          }
        } catch (paymobError) {
          console.error("⚠️ Paymob verification error:", paymobError.message);
        }
      }

      // Return current status from database
      console.log("ℹ️ Payment not confirmed yet");
      return {
        paid: appointment.paid,
        status: appointment.status,
        message: "Payment not confirmed yet",
      };
    } catch (error) {
      console.error("Payment Service - Verify Error:", error);
      throw error;
    }
  }
}

module.exports = new PaymentService();
