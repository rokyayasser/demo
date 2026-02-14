/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Create axios instance with default config
  const api = axios.create({
    baseURL: backendUrl,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Add token to requests if available
  api.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.token = token;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Handle 401 responses
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        setToken("");
        setUserData(null);
        localStorage.removeItem("token");
        toast.info("انتهت جلسة العمل، يرجى تسجيل الدخول مرة أخرى");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );

  // Load user profile
  const loadUserProfileData = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const { data } = await api.get("/api/v1/user/profile");
      if (data.success) {
        // FIX: BaseController wraps response in data envelope
        // API returns: { success: true, data: { user: {...} } }
        // axios response.data = { success: true, data: { user: {...} } }
        // so we need data.data.user, with fallback to data.user for safety
        setUserData(data.data?.user || data.user);
      }
    } catch (error) {
      console.error("Failed to load user profile:", error);
      if (error.response?.status !== 401) {
        toast.error("فشل تحميل بيانات المستخدم");
      }
    } finally {
      setLoading(false);
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update user profile
  const updateUserProfile = async (updateData) => {
    try {
      const { data } = await api.post("/api/v1/user/profile", updateData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (data.success) {
        toast.success(data.message);
        await loadUserProfileData();
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
      return false;
    }
  };

  // Logout
  const logout = () => {
    setToken("");
    setUserData(null);
    localStorage.removeItem("token");
    toast.success("تم تسجيل الخروج بنجاح");
  };

  // Auto-load user data when token changes
  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      if (!token || !mounted) return;

      setLoading(true);
      try {
        const { data } = await api.get("/api/v1/user/profile");
        if (data.success && mounted) {
          // FIX: BaseController wraps response in data envelope
          // API returns: { success: true, data: { user: {...} } }
          // so we need data.data.user, with fallback to data.user for safety
          setUserData(data.data?.user || data.user);
        }
      } catch (error) {
        console.error("Failed to load user profile:", error);
        if (error.response?.status !== 401 && error.response?.status !== 403) {
          toast.error("فشل تحميل بيانات المستخدم");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (token) {
      loadProfile();
    } else {
      setUserData(null);
    }

    return () => {
      mounted = false;
    };
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const value = {
    backendUrl,
    token,
    setToken,
    userData,
    setUserData,
    loading,
    loadUserProfileData,
    updateUserProfile,
    logout,
    api,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
