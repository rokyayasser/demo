/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import api from "../services/api.config";

export const AdminContext = createContext(null);

const AdminContextProvider = ({ children }) => {
  const [aToken, setAToken] = useState(
    () => localStorage.getItem("aToken") || "",
  );

  // ── Data states ────────────────────────────────────────────────────────────
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [dashStats, setDashStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [products, setProducts] = useState([]);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  // ── Auth ───────────────────────────────────────────────────────────────────
  const adminLogin = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post("/api/v1/admin/login", {
        email,
        password,
      });
      if (data.success) {
        localStorage.setItem("aToken", data.data.token);
        setAToken(data.data.token);
        toast.success("تم تسجيل الدخول كمدير");
        return true;
      }
      toast.error(data.message || "فشل تسجيل الدخول");
      return false;
    } catch (err) {
      toast.error(err.response?.data?.message || "خطأ في تسجيل الدخول");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const adminLogout = useCallback(() => {
    localStorage.removeItem("aToken");
    setAToken("");
    setServices([]);
    setAppointments([]);
    setCourses([]);
    setProducts([]);
    setUsers([]);
    toast.info("تم تسجيل خروج المدير");
  }, []);

  // ── Helper: auth headers ───────────────────────────────────────────────────
  const authHeaders = useCallback(
    () => ({
      headers: { token: aToken },
    }),
    [aToken],
  );

  // ── Dashboard stats ────────────────────────────────────────────────────────
  const getDashboardStats = useCallback(async () => {
    try {
      const { data } = await api.get(
        "/api/v1/admin/dashboard/stats",
        authHeaders(),
      );
      if (data.success) setDashStats(data.data);
    } catch (err) {
      console.error("getDashboardStats:", err.message);
    }
  }, [authHeaders]);

  // ── Services ───────────────────────────────────────────────────────────────
  const getServices = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/v1/admin/services", authHeaders());
      if (data.success) {
        // API returns { data: { services: [...] } }
        const raw = data.data;
        setServices(
          Array.isArray(raw)
            ? raw
            : Array.isArray(raw?.services)
              ? raw.services
              : raw?.data || [],
        );
      }
    } catch (err) {
      toast.error("فشل تحميل الخدمات");
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  const addService = useCallback(
    async (formData) => {
      setLoading(true);
      try {
        const { data } = await api.post("/api/v1/admin/services", formData, {
          headers: { token: aToken, "Content-Type": "multipart/form-data" },
        });
        if (data.success) {
          toast.success("تم إضافة الخدمة بنجاح");
          await getServices();
          return true;
        }
        toast.error(data.message || "فشل إضافة الخدمة");
        return false;
      } catch (err) {
        toast.error(err.response?.data?.message || "فشل إضافة الخدمة");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [aToken, getServices],
  );

  const updateService = useCallback(
    async (serviceId, formData) => {
      setLoading(true);
      try {
        const { data } = await api.put(
          `/api/v1/admin/services/${serviceId}`,
          formData,
          {
            headers: { token: aToken, "Content-Type": "multipart/form-data" },
          },
        );
        if (data.success) {
          toast.success("تم تحديث الخدمة");
          await getServices();
          return true;
        }
        toast.error(data.message);
        return false;
      } catch (err) {
        toast.error(err.response?.data?.message || "فشل تحديث الخدمة");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [aToken, getServices],
  );

  const deleteService = useCallback(
    async (serviceId) => {
      try {
        const { data } = await api.delete(
          `/api/v1/admin/services/${serviceId}`,
          authHeaders(),
        );
        if (data.success) {
          toast.success("تم حذف الخدمة");
          setServices((p) => p.filter((s) => s._id !== serviceId));
          return true;
        }
        return false;
      } catch (err) {
        toast.error("فشل حذف الخدمة");
        return false;
      }
    },
    [authHeaders],
  );

  const toggleServiceAvailability = useCallback(
    async (serviceId) => {
      try {
        const { data } = await api.patch(
          `/api/v1/admin/services/${serviceId}/toggle`,
          {},
          authHeaders(),
        );
        if (data.success) {
          setServices((p) =>
            p.map((s) =>
              s._id === serviceId ? { ...s, available: !s.available } : s,
            ),
          );
          toast.success("تم تغيير حالة الخدمة");
        }
      } catch (err) {
        toast.error("فشل تغيير حالة الخدمة");
      }
    },
    [authHeaders],
  );

  // ── Appointments ───────────────────────────────────────────────────────────
  const getAppointments = useCallback(
    async (filters = {}) => {
      setLoading(true);
      try {
        const { data } = await api.get("/api/v1/admin/appointments", {
          ...authHeaders(),
          params: filters,
        });
        if (data.success) {
          const raw = data.data;
          setAppointments(
            Array.isArray(raw) ? raw : raw?.appointments || raw?.data || [],
          );
        }
      } catch (err) {
        toast.error("فشل تحميل المواعيد");
      } finally {
        setLoading(false);
      }
    },
    [authHeaders],
  );

  const updateAppointmentStatus = useCallback(
    async (appointmentId, status) => {
      try {
        const { data } = await api.post(
          "/api/v1/admin/appointments/status",
          {
            appointmentId,
            status,
          },
          authHeaders(),
        );
        if (data.success) {
          setAppointments((p) =>
            p.map((a) => (a._id === appointmentId ? { ...a, status } : a)),
          );
          toast.success("تم تحديث حالة الموعد");
          return true;
        }
        return false;
      } catch (err) {
        toast.error("فشل تحديث الموعد");
        return false;
      }
    },
    [authHeaders],
  );

  // ── Blocked slots ──────────────────────────────────────────────────────────
  const getBlockedSlots = useCallback(async () => {
    try {
      const { data } = await api.get(
        "/api/v1/admin/slots/blocked",
        authHeaders(),
      );
      if (data.success) setBlockedSlots(data.data?.slots || data.data || []);
    } catch (err) {
      console.error("getBlockedSlots:", err.message);
    }
  }, [authHeaders]);

  const blockSlot = useCallback(
    async (date, time, reason = "") => {
      // BlockSlots.jsx may call blockSlot(rangeObject) with no time arg
      // Detect that shape and send flat fields so backend handles it correctly
      if (
        date &&
        typeof date === "object" &&
        (date.startDate || date.startTime)
      ) {
        return blockTimeSlotRange(date);
      }
      try {
        const { data } = await api.post(
          "/api/v1/admin/slots/block",
          { date, time, reason },
          authHeaders(),
        );
        if (data.success) {
          toast.success("تم حظر الموعد");
          await getBlockedSlots();
          return true;
        }
        return false;
      } catch (err) {
        toast.error("فشل حظر الموعد");
        return false;
      }
    },
    [authHeaders, getBlockedSlots],
  );

  // blockTimeSlotRange accepts { startDate, endDate, startTime, endTime, reason }
  // This is what BlockSlots.jsx calls
  const blockTimeSlotRange = useCallback(
    async (rangeData) => {
      try {
        const body = {
          startDate: rangeData.startDate,
          endDate: rangeData.endDate || rangeData.startDate,
          startTime: rangeData.startTime || "",
          endTime: rangeData.endTime || "",
          reason: rangeData.reason || "",
        };
        const { data } = await api.post(
          "/api/v1/admin/slots/block",
          body,
          authHeaders(),
        );
        if (data.success) {
          toast.success(data.message || "تم حظر المواعيد بنجاح");
          await getBlockedSlots();
          return { success: true, blockedCount: data.data?.blockedCount || 0 };
        }
        toast.error(data.message || "فشل حظر المواعيد");
        return { success: false };
      } catch (err) {
        toast.error(err.response?.data?.message || "فشل حظر المواعيد");
        return { success: false };
      }
    },
    [authHeaders, getBlockedSlots],
  );

  const unblockSlot = useCallback(
    async (slotId) => {
      try {
        const { data } = await api.delete(
          `/api/v1/admin/slots/unblock/${slotId}`,
          authHeaders(),
        );
        if (data.success) {
          toast.success("تم إلغاء حظر الموعد");
          setBlockedSlots((p) => p.filter((s) => s._id !== slotId));
          return true;
        }
        return false;
      } catch (err) {
        toast.error("فشل إلغاء الحظر");
        return false;
      }
    },
    [authHeaders],
  );

  // ── Courses ────────────────────────────────────────────────────────────────
  const getCourses = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/v1/courses", authHeaders());
      if (data.success) {
        const raw = data.data;
        setCourses(
          Array.isArray(raw)
            ? raw
            : Array.isArray(raw?.data)
              ? raw.data
              : Array.isArray(raw?.courses)
                ? raw.courses
                : [],
        );
      }
    } catch (err) {
      toast.error("فشل تحميل الكورسات");
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  const addCourse = useCallback(
    async (formData) => {
      setLoading(true);
      try {
        const { data } = await api.post("/api/v1/courses", formData, {
          headers: { token: aToken, "Content-Type": "multipart/form-data" },
        });
        if (data.success) {
          toast.success("تم إضافة الكورس بنجاح");
          await getCourses();
          return true;
        }
        toast.error(data.message);
        return false;
      } catch (err) {
        toast.error(err.response?.data?.message || "فشل إضافة الكورس");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [aToken, getCourses],
  );

  const updateCourse = useCallback(
    async (courseId, formData) => {
      setLoading(true);
      try {
        const { data } = await api.put(
          `/api/v1/courses/${courseId}`,
          formData,
          {
            headers: { token: aToken, "Content-Type": "multipart/form-data" },
          },
        );
        if (data.success) {
          toast.success("تم تحديث الكورس");
          await getCourses();
          return true;
        }
        return false;
      } catch (err) {
        toast.error("فشل تحديث الكورس");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [aToken, getCourses],
  );

  const deleteCourse = useCallback(
    async (courseId) => {
      try {
        const { data } = await api.delete(
          `/api/v1/courses/${courseId}`,
          authHeaders(),
        );
        if (data.success) {
          toast.success("تم حذف الكورس");
          setCourses((p) => p.filter((c) => c._id !== courseId));
          return true;
        }
        return false;
      } catch (err) {
        toast.error("فشل حذف الكورس");
        return false;
      }
    },
    [authHeaders],
  );

  // ── Products ───────────────────────────────────────────────────────────────
  const getProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        "/api/v1/products/admin/all",
        authHeaders(),
      );
      if (data.success) {
        const raw = data.data;
        setProducts(
          Array.isArray(raw)
            ? raw
            : Array.isArray(raw?.products)
              ? raw.products
              : Array.isArray(raw?.data)
                ? raw.data
                : [],
        );
      }
    } catch (err) {
      toast.error("فشل تحميل المنتجات");
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  const addProduct = useCallback(
    async (formData) => {
      setLoading(true);
      try {
        const { data } = await api.post("/api/v1/products", formData, {
          headers: { token: aToken, "Content-Type": "multipart/form-data" },
        });
        if (data.success) {
          toast.success("تم إضافة المنتج");
          await getProducts();
          return true;
        }
        toast.error(data.message);
        return false;
      } catch (err) {
        toast.error("فشل إضافة المنتج");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [aToken, getProducts],
  );

  const updateProduct = useCallback(
    async (productId, formData) => {
      setLoading(true);
      try {
        const { data } = await api.put(
          `/api/v1/products/${productId}`,
          formData,
          {
            headers: { token: aToken, "Content-Type": "multipart/form-data" },
          },
        );
        if (data.success) {
          toast.success("تم تحديث المنتج");
          await getProducts();
          return true;
        }
        return false;
      } catch (err) {
        toast.error("فشل تحديث المنتج");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [aToken, getProducts],
  );

  const deleteProduct = useCallback(
    async (productId) => {
      try {
        const { data } = await api.delete(
          `/api/v1/products/${productId}`,
          authHeaders(),
        );
        if (data.success) {
          toast.success("تم حذف المنتج");
          setProducts((p) => p.filter((p2) => p2._id !== productId));
          return true;
        }
        return false;
      } catch (err) {
        toast.error("فشل حذف المنتج");
        return false;
      }
    },
    [authHeaders],
  );

  // ── Users (read-only) ──────────────────────────────────────────────────────
  const getUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/v1/admin/users", authHeaders());
      if (data.success) {
        const raw = data.data;
        setUsers(Array.isArray(raw) ? raw : raw?.users || []);
      }
    } catch (err) {
      console.error("getUsers:", err.message);
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  return (
    <AdminContext.Provider
      value={{
        aToken,
        backendUrl,
        loading,
        // Auth
        adminLogin,
        adminLogout,
        // Dashboard
        dashStats,
        getDashboardStats,
        // Services
        services,
        getServices,
        addService,
        updateService,
        deleteService,
        toggleServiceAvailability,
        // Appointments
        appointments,
        getAppointments,
        updateAppointmentStatus,
        // Slots
        blockedSlots,
        getBlockedSlots,
        blockSlot,
        unblockSlot,
        blockTimeSlotRange, // real function — BlockSlots.jsx calls this
        unblockTimeSlot: unblockSlot, // alias — BlockSlots.jsx calls this name
        // Courses
        courses,
        getCourses,
        addCourse,
        updateCourse,
        deleteCourse,
        // Products
        products,
        getProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        // Users
        users,
        getUsers,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;
