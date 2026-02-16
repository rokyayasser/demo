const BaseController = require("../BaseController");
const paymentService = require("../../services/payment.service");

class SharedPaymentController extends BaseController {
  constructor() {
    super();
    this.initiatePayment = this.initiatePayment.bind(this);
    this.handleCallback = this.handleCallback.bind(this);
    this.checkPaymentStatus = this.checkPaymentStatus.bind(this);
    this.verifyPayment = this.verifyPayment.bind(this);
  }

  async initiatePayment(req, res) {
    try {
      const { appointmentId } = req.body;
      const userId = req.userId;

      if (!appointmentId) {
        return this.badRequest(res, "Appointment ID is required");
      }

      const paymentResult = await paymentService.initiatePayment(
        appointmentId,
        userId,
      );

      return this.success(res, paymentResult, "Payment initiated successfully");
    } catch (error) {
      console.error("Initiate Payment Error:", error);

      if (error.message.includes("Appointment not found")) {
        return this.notFound(res, "Appointment not found");
      }
      if (error.message.includes("already paid")) {
        return this.conflict(res, "Appointment already paid");
      }
      if (error.message.includes("Unauthorized")) {
        return this.unauthorized(res, "Unauthorized");
      }

      return this.error(res, error.message);
    }
  }

  async handleCallback(req, res) {
    try {
      const callbackData = req.body.obj || req.body;
      const receivedHmac = req.query.hmac;

      if (!callbackData) {
        return this.badRequest(res, "No callback data received");
      }

      const result = await paymentService.handleCallback(
        callbackData,
        receivedHmac,
      );

      if (result.success) {
        return this.success(res, result, "Payment processed successfully");
      } else {
        return this.error(res, result.message, 400);
      }
    } catch (error) {
      console.error("Payment Callback Error:", error);

      if (error.message.includes("Invalid callback signature")) {
        return this.error(res, "Invalid callback signature", 400);
      }
      if (error.message.includes("Appointment not found")) {
        return this.notFound(res, "Appointment not found");
      }

      return this.error(res, error.message);
    }
  }

  async checkPaymentStatus(req, res) {
    try {
      const { appointmentId } = req.params;
      const userId = req.userId;

      const status = await paymentService.checkPaymentStatus(
        appointmentId,
        userId,
      );

      return this.success(res, status, "Payment status retrieved");
    } catch (error) {
      console.error("Check Payment Status Error:", error);

      if (error.message.includes("Appointment not found")) {
        return this.notFound(res, "Appointment not found");
      }
      if (error.message.includes("Unauthorized")) {
        return this.unauthorized(res, "Unauthorized");
      }

      return this.error(res, error.message);
    }
  }

  async verifyPayment(req, res) {
    try {
      const { appointmentId } = req.params;
      const userId = req.userId;

      const result = await paymentService.verifyPaymentWithPaymob(
        appointmentId,
        userId,
      );

      return this.success(res, result, "Payment verification completed");
    } catch (error) {
      console.error("Verify Payment Error:", error);
      return this.error(res, error.message);
    }
  }
}

module.exports = new SharedPaymentController();
