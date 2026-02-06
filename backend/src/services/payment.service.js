const paymob = require("../config/paymob");
const Appointment = require("../models/Appointment");
const User = require("../models/User");

class PaymentService {
  constructor() {
    this.paymob = paymob;
  }

  async initiatePayment(appointmentId, userId) {
    try {
      // Get appointment
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        throw new Error("Appointment not found");
      }

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

      const userInfo = {
        name: user.name,
        email: user.email,
        phone: user.phone || "01000000000",
      };

      // Initiate payment with Paymob
      const paymentData = await this.paymob.initiatePayment(
        appointmentId,
        appointment.amount,
        userInfo
      );

      // Store payment info in appointment
      appointment.paymobOrderId = paymentData.orderId;
      appointment.paymobMerchantOrderId = paymentData.merchantOrderId;
      appointment.paymentInitiatedAt = new Date();
      await appointment.save();

      return {
        success: true,
        message: "Payment initiated successfully",
        paymentUrl: paymentData.iframeUrl,
        paymentKey: paymentData.paymentKey,
        orderId: paymentData.orderId,
      };
    } catch (error) {
      console.error("Payment Service - Initiate Error:", error);
      throw error;
    }
  }

  async handleCallback(callbackData, receivedHmac) {
    try {
      // Verify HMAC
      const hmacValid = this.paymob.verifyCallback(callbackData, receivedHmac);
      if (!hmacValid) {
        throw new Error("Invalid callback signature");
      }

      // Extract appointment ID from merchant_order_id
      const merchantOrderId = callbackData.order?.merchant_order_id;
      if (!merchantOrderId) {
        throw new Error("Invalid callback data: missing merchant_order_id");
      }

      const appointmentId = merchantOrderId.split("_")[0];
      const success =
        callbackData.success === true || callbackData.success === "true";

      // Find appointment
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        throw new Error("Appointment not found");
      }

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

        // Send confirmation email
        // Note: You would need to implement this
        // await emailService.sendPaymentConfirmation(appointment);

        return {
          success: true,
          appointmentId,
          message: "Payment processed successfully",
        };
      } else {
        // Payment failed
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
      console.error("Payment Service - Callback Error:", error);
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
        return {
          paid: true,
          status: appointment.status,
          message: "Payment already confirmed",
        };
      }

      // Check with Paymob if we have an order ID
      if (appointment.paymobOrderId) {
        try {
          const order = await this.paymob.getOrderStatus(
            appointment.paymobOrderId
          );

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
              }
            }

            await appointment.save();

            return {
              paid: true,
              status: "confirmed",
              message: "Payment confirmed via Paymob verification",
            };
          }
        } catch (paymobError) {
          console.error("Paymob verification error:", paymobError);
        }
      }

      // Return current status from database
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
