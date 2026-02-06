import api from "./axios.config";

export const appointmentApi = {
  // Book new appointment
  bookAppointment: async (formData) => {
    try {
      const response = await api.post("/api/v1/appointments", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000,
      });
      return response.data;
    } catch (error) {
      console.error("Book appointment error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to book appointment",
      };
    }
  },

  // Get user appointments
  getUserAppointments: async () => {
    try {
      const response = await api.get("/api/v1/appointments/user");
      return response.data;
    } catch (error) {
      console.error("Get user appointments error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to get appointments",
      };
    }
  },

  // Cancel appointment
  cancelAppointment: async (appointmentId) => {
    try {
      const response = await api.post("/api/v1/appointments/cancel", {
        appointmentId,
      });
      return response.data;
    } catch (error) {
      console.error("Cancel appointment error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to cancel appointment",
      };
    }
  },

  // Get available slots
  getAvailableSlots: async (date) => {
    try {
      const response = await api.get(
        `/api/v1/appointments/available-slots/${date}`
      );
      return response.data;
    } catch (error) {
      console.error("Get available slots error:", error);
      return {
        success: false,
        slots: [],
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to get available slots",
      };
    }
  },

  // Check slot availability
  checkSlotAvailability: async (date, time) => {
    try {
      const response = await api.get("/api/v1/appointments/check-slot", {
        params: { date, time },
      });
      return response.data;
    } catch (error) {
      console.error("Check slot availability error:", error);
      return {
        isAvailable: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to check slot availability",
      };
    }
  },

  // Get booked slots - FIXED VERSION
  getBookedSlots: async () => {
    try {
      const response = await api.get("/api/v1/appointments/booked-slots");
      console.log("Booked slots API response:", response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error(
        "Get booked slots error:",
        error.response?.data || error.message
      );
      // Return a fallback response structure
      return {
        success: false,
        bookedSlots: {},
        blockedSlots: {},
        message: "Failed to load booked slots. Please try again later.",
        error: error.response?.data || error.message,
      };
    }
  },
};
