import api from "./axios.config";

export const paymentApi = {
  // Initiate payment for an appointment — returns { paymentUrl, iframeUrl, paymentKey }
  initiatePayment: async (appointmentId) => {
    try {
      const response = await api.post("/api/v1/payment/initiate", {
        appointmentId,
      });
      return response.data;
    } catch (error) {
      console.error("Initiate payment error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "فشل بدء عملية الدفع",
      };
    }
  },

  // Check payment status for an appointment
  checkPaymentStatus: async (appointmentId) => {
    try {
      const response = await api.get(`/api/v1/payment/status/${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error("Check payment status error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "فشل التحقق من حالة الدفع",
      };
    }
  },

  // Verify payment with Paymob (call after payment popup closes)
  verifyPayment: async (appointmentId) => {
    try {
      const response = await api.get(`/api/v1/payment/verify/${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error("Verify payment error:", error);
      return {
        success: false,
        paid: false,
        message: error.response?.data?.message || "فشل التحقق من الدفع",
      };
    }
  },
};
