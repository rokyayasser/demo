import api from "./axios.config";

export const paymentApi = {
  // Initiate payment
  initiatePayment: async (appointmentId) => {
    const response = await api.post("/api/v1/payment/initiate", {
      appointmentId,
    });
    return response.data;
  },

  // Check payment status
  checkPaymentStatus: async (appointmentId) => {
    const response = await api.get(`/api/v1/payment/status/${appointmentId}`);
    return response.data;
  },

  // Verify payment
  verifyPayment: async (appointmentId) => {
    const response = await api.get(`/api/v1/payment/verify/${appointmentId}`);
    return response.data;
  },
};
