import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

// ─── Session Config ───────────────────────────────────────────────────────────
// JWT is set to 7d in the backend. We mirror that here so the browser
// auto-clears the token without a round-trip to the server.
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const TOKEN_KEY = "token";
const TOKEN_EXPIRY_KEY = "token_expiry";

export const setSession = (token) => {
  const expiry = Date.now() + SESSION_DURATION_MS;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_EXPIRY_KEY, String(expiry));
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
};

export const getToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiry = parseInt(localStorage.getItem(TOKEN_EXPIRY_KEY) || "0", 10);

  if (!token) return null;

  // Expired client-side? Clear immediately
  if (Date.now() > expiry) {
    clearSession();
    return null;
  }

  return token;
};

export const isSessionValid = () => Boolean(getToken());

// ─── Axios Instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: backendUrl,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — attach token if valid
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.token = token;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — clear session on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearSession();
      // Emit a custom event so AppContext can react without coupling
      window.dispatchEvent(new CustomEvent("session:expired"));
    }
    return Promise.reject(error);
  },
);

export default api;
