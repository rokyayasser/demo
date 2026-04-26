/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { toast } from "react-toastify";
import api, { setSession, clearSession, getToken } from "../api/axios.config";

export const AppContext = createContext(null);

const FIELD_LABELS_AR = {
  name: "الاسم",
  email: "البريد الإلكتروني",
  password: "كلمة المرور",
  phone: "رقم الهاتف",
  gender: "الجنس",
  birthdate: "تاريخ الميلاد",
  dob: "تاريخ الميلاد",
  height: "الطول",
  weight: "الوزن",
  city: "المدينة",
  country: "الدولة",
  address: "العنوان",
  healthGoal: "الهدف الصحي",
  chronicDiseases: "الأمراض المزمنة",
  // Appointment fields
  serviceId: "الخدمة",
  date: "التاريخ",
  time: "الوقت",
  category: "الفئة",
  amount: "المبلغ",
  firstName: "الاسم الأول",
  lastName: "اسم العائلة",
  age: "العمر",
  currentHealthStatus: "الحالة الصحية",
  consultationGoal: "هدف الاستشارة",
};

/**
 * Returns the most specific Arabic error message from an Axios error.
 * Reads the errors[] array first so the user sees the exact field problem,
 * not just the generic "Validation failed" wrapper.
 */
export const extractArabicError = (err, fallback = "حدث خطأ غير متوقع") => {
  const data = err?.response?.data;
  if (!data) return err?.message || fallback;

  if (Array.isArray(data.errors) && data.errors.length > 0) {
    const first = data.errors[0];
    // Already Arabic? Use it directly
    if (first.message && /[\u0600-\u06FF]/.test(first.message)) {
      return first.message;
    }
    const label = FIELD_LABELS_AR[first.field];
    return label ? `${label}: ${first.message}` : first.message || fallback;
  }

  if (data.message) return data.message;
  return fallback;
};

/** Show a toast exactly once — prevents StrictMode double-fire */
const showToast = (type, message, id) => {
  if (id && toast.isActive(id)) return;
  toast[type](message, id ? { toastId: id } : undefined);
};

const AppContextProvider = ({ children }) => {
  const [token, setToken] = useState(() => getToken());
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
  const profileFetchInFlight = useRef(false);

  useEffect(() => {
    const onExpired = () => {
      setToken(null);
      setUserData(null);
      showToast(
        "error",
        "انتهت جلستك — يرجى تسجيل الدخول مرة أخرى",
        "session-expired",
      );
    };
    window.addEventListener("session:expired", onExpired);
    return () => window.removeEventListener("session:expired", onExpired);
  }, []);

  const register = async (
    name,
    email,
    password,
    phoneOrExtras = "01000000000",
    extras = {},
  ) => {
    let phone = "01000000000";
    let extraFields = {};
    if (typeof phoneOrExtras === "object" && phoneOrExtras !== null) {
      extraFields = phoneOrExtras;
    } else {
      phone = phoneOrExtras || "01000000000";
      extraFields = extras;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/api/v1/user/register", {
        name,
        email,
        password,
        phone,
        ...extraFields,
      });
      if (data.success) {
        setSession(data.data?.token);
        setToken(data.data?.token);
        showToast("success", "🎉 تم إنشاء الحساب بنجاح", "register-success");
      } else {
        showToast(
          "error",
          data.message || "فشل إنشاء الحساب",
          "register-error",
        );
      }
    } catch (err) {
      showToast(
        "error",
        extractArabicError(err, "فشل إنشاء الحساب"),
        "register-error",
      );
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post("/api/v1/user/login", {
        email,
        password,
      });
      if (data.success) {
        setSession(data.data?.token);
        setToken(data.data?.token);
        showToast("success", "✅ تم تسجيل الدخول بنجاح", "login-success");
      } else {
        showToast("error", data.message || "فشل تسجيل الدخول", "login-error");
      }
    } catch (err) {
      showToast(
        "error",
        extractArabicError(err, "فشل تسجيل الدخول"),
        "login-error",
      );
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    clearSession();
    setToken(null);
    setUserData(null);
    showToast("info", "تم تسجيل الخروج", "logout");
  }, []);

  const loadUserProfileData = useCallback(async () => {
    if (!getToken()) return;
    if (profileFetchInFlight.current) return;
    profileFetchInFlight.current = true;
    setLoading(true);
    try {
      const { data } = await api.get("/api/v1/user/profile");
      if (data.success) setUserData(data.data?.user);
      else logout();
    } catch (err) {
      if (err.response?.status === 401) logout();
    } finally {
      setLoading(false);
      profileFetchInFlight.current = false;
    }
  }, [logout]);

  const updateUserProfile = async (formData) => {
    if (!getToken()) return false;
    setLoading(true);
    try {
      const { data } = await api.post("/api/v1/user/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data.success) {
        setUserData(data.data?.user);
        return true;
      }
      showToast(
        "error",
        data.message || "فشل تحديث الملف الشخصي",
        "profile-update-error",
      );
      return false;
    } catch (err) {
      showToast(
        "error",
        extractArabicError(err, "فشل تحديث الملف الشخصي"),
        "profile-update-error",
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadUserProfileData();
  }, [token, loadUserProfileData]);

  return (
    <AppContext.Provider
      value={{
        token,
        userData,
        loading,
        backendUrl,
        api,
        register,
        login,
        logout,
        loadUserProfileData,
        updateUserProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
