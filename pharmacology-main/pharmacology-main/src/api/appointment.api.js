import api from "./axios.config";

export const appointmentApi = {
  // Book a new appointment (multipart/form-data with optional files)
  bookAppointment: async (formData) => {
    try {
      const response = await api.post("/api/v1/appointments", formData, {
        headers: { "Content-Type": "multipart/form-data" },
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

  // Get authenticated user's appointments
  getUserAppointments: async (params = {}) => {
    try {
      const response = await api.get("/api/v1/appointments/user", { params });
      return response.data;
    } catch (error) {
      console.error("Get user appointments error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to get appointments",
        data: { data: [], pagination: {} },
      };
    }
  },

  // Cancel an appointment
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
          error.response?.data?.message || "Failed to cancel appointment",
      };
    }
  },

  // Get available time slots for a date
  getAvailableSlots: async (date) => {
    try {
      const response = await api.get(
        `/api/v1/appointments/available-slots/${date}`,
      );
      return response.data;
    } catch (error) {
      console.error("Get available slots error:", error);
      return {
        success: false,
        slots: [],
        message:
          error.response?.data?.message || "Failed to get available slots",
      };
    }
  },

  // Check if a specific slot is available
  checkSlotAvailability: async (date, time) => {
    try {
      const response = await api.get("/api/v1/appointments/check-slot", {
        params: { date, time },
      });
      // Return the data object directly
      return response.data.data || { isAvailable: false, message: "غير متاح" };
    } catch (error) {
      console.error("Check slot availability error:", error);
      return {
        isAvailable: false,
        message: error.response?.data?.message || "Failed to check slot",
      };
    }
  },

  // Get all booked slots (for calendar display)
  getBookedSlots: async (date) => {
    try {
      const params = date ? { date } : {};
      const response = await api.get("/api/v1/appointments/booked-slots", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Get booked slots error:", error);
      return {
        success: false,
        bookedSlots: {},
        blockedSlots: {},
        message: "Failed to load booked slots",
      };
    }
  },

  // Get all medical services
  getAllServices: async (params = {}) => {
    try {
      const response = await api.get("/api/v1/appointments/medical-services", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Get services error:", error);
      return { success: false, data: { data: [] } };
    }
  },

  // Get a single service
  getServiceById: async (serviceId) => {
    try {
      const response = await api.get(
        `/api/v1/appointments/medical-services/${serviceId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Get service error:", error);
      return { success: false, data: null };
    }
  },
};
