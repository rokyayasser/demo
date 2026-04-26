/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useCallback } from "react";
import { toast } from "react-toastify";
import api from "../services/api.config";

export const DoctorContext = createContext(null);

const DoctorContextProvider = ({ children }) => {
  const [dToken, setDToken] = useState(
    () => localStorage.getItem("dToken") || "",
  );

  const [appointments, setAppointments] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [calendarData, setCalendarData] = useState({});
  const [doctorStats, setDoctorStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  // ── Auth ───────────────────────────────────────────────────────────────────
  const doctorLogin = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post("/api/v1/doctor/login", {
        email,
        password,
      });
      if (data.success) {
        localStorage.setItem("dToken", data.data.token);
        setDToken(data.data.token);
        toast.success("تم تسجيل الدخول كطبيب");
        return true;
      }
      toast.error(data.message || "بيانات غير صحيحة");
      return false;
    } catch (err) {
      toast.error(err.response?.data?.message || "خطأ في تسجيل الدخول");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const doctorLogout = useCallback(() => {
    localStorage.removeItem("dToken");
    setDToken("");
    setAppointments([]);
    setTodayAppointments([]);
    setDoctorStats(null);
    toast.info("تم تسجيل خروج الطبيب");
  }, []);

  const authH = useCallback(() => ({ headers: { token: dToken } }), [dToken]);

  // ── Appointments ───────────────────────────────────────────────────────────
  const getAppointments = useCallback(
    async (filters = {}) => {
      setLoading(true);
      try {
        const { data } = await api.get("/api/v1/doctor/appointments", {
          ...authH(),
          params: filters,
        });
        if (data.success) {
          const raw = data.data;
          setAppointments(
            Array.isArray(raw) ? raw : raw?.appointments || raw?.data || [],
          );
        }
      } catch (err) {
        console.error("getAppointments:", err.message);
      } finally {
        setLoading(false);
      }
    },
    [authH],
  );

  const getTodayAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        "/api/v1/doctor/appointments/today",
        authH(),
      );
      if (data.success) {
        const raw = data.data;
        setTodayAppointments(
          Array.isArray(raw) ? raw : raw?.appointments || [],
        );
      }
    } catch (err) {
      console.error("getTodayAppointments:", err.message);
    } finally {
      setLoading(false);
    }
  }, [authH]);

  const getAppointmentsByDate = useCallback(
    async (date) => {
      try {
        const { data } = await api.get(
          `/api/v1/doctor/appointments/date/${encodeURIComponent(date)}`,
          authH(),
        );
        if (data.success) {
          const raw = data.data;
          return Array.isArray(raw) ? raw : raw?.appointments || [];
        }
        return [];
      } catch {
        return [];
      }
    },
    [authH],
  );

  const updateAppointmentStatus = useCallback(
    async (appointmentId, status, notes = "") => {
      try {
        const { data } = await api.put(
          `/api/v1/doctor/appointments/${appointmentId}/status`,
          { status, doctorNotes: notes },
          authH(),
        );
        if (data.success) {
          const updateList = (list) =>
            list.map((a) =>
              a._id === appointmentId
                ? { ...a, status, doctorNotes: notes }
                : a,
            );
          setAppointments(updateList);
          setTodayAppointments(updateList);
          toast.success("تم تحديث الحالة");
          return true;
        }
        return false;
      } catch (err) {
        console.error("updateAppointmentStatus:", err.message);
        return false;
      }
    },
    [authH],
  );

  // ── Calendar ───────────────────────────────────────────────────────────────
  const getCalendarData = useCallback(
    async (month, year) => {
      try {
        const { data } = await api.get("/api/v1/doctor/calendar", {
          ...authH(),
          params: { month, year },
        });
        if (data.success) setCalendarData(data.data || {});
      } catch {
        // Handle error silently
      }
    },
    [authH],
  );

  // ── Stats ──────────────────────────────────────────────────────────────────
  const getDoctorStats = useCallback(async () => {
    try {
      const { data } = await api.get("/api/v1/doctor/stats", authH());
      if (data.success) setDoctorStats(data.data);
    } catch (err) {
      console.error("getDoctorStats:", err.message);
    }
  }, [authH]);

  return (
    <DoctorContext.Provider
      value={{
        dToken,
        backendUrl,
        loading,
        doctorLogin,
        doctorLogout,
        appointments,
        getAppointments,
        todayAppointments,
        getTodayAppointments,
        getAppointmentsByDate,
        updateAppointmentStatus,
        calendarData,
        getCalendarData,
        doctorStats,
        getDoctorStats,
      }}
    >
      {children}
    </DoctorContext.Provider>
  );
};

export default DoctorContextProvider;
