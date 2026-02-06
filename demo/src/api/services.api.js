import api from "./axios.config";

export const servicesApi = {
  // Get all medical services
  getAllServices: async () => {
    const response = await api.get("/api/v1/appointments/medical-services");
    return response.data;
  },

  // Get service by ID
  getServiceById: async (serviceId) => {
    const response = await api.get(
      `/api/v1/appointments/medical-services/${serviceId}`
    );
    return response.data;
  },

  // Get services by category
  getServicesByCategory: async (category) => {
    const response = await api.get(
      `/api/v1/appointments/medical-services/category/${category}`
    );
    return response.data;
  },
};
