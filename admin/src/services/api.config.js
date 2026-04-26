// src/services/api.config.js  (admin/doctor panel)
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor ───────────────────────────────────────────────────────
// Reads whichever token is stored (admin takes priority)
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("aToken") || localStorage.getItem("dToken") || "";

    if (token) {
      // Backend expects `token` header (not `Authorization: Bearer ...`)
      config.headers["token"] = token;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor ──────────────────────────────────────────────────────
// On 401, clear both tokens and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("aToken");
      localStorage.removeItem("dToken");
      // Redirect to the login page of this panel
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
