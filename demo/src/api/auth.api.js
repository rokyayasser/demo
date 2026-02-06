import api from "./axios.config";

export const authApi = {
  // User registration
  register: async (userData) => {
    const response = await api.post("/api/v1/user/register", userData);
    return response.data;
  },

  // User login
  login: async (credentials) => {
    const response = await api.post("/api/v1/user/login", credentials);
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get("/api/v1/user/profile");
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.post("/api/v1/user/profile", profileData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
