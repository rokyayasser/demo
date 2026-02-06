/* eslint-disable react-refresh/only-export-components */
import axios from "axios";
import { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
  const [aToken, setAToken] = useState(
    localStorage.getItem("aToken") ? localStorage.getItem("aToken") : ""
  );
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [courses, setCourses] = useState([]); // إضافة للحصول على الدورات
  const [loading, setLoading] = useState(false);
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  // Automatically load data when token changes
  useEffect(() => {
    if (aToken) {
      getAllServices();
      getAllAppointments();
      getBlockedSlots();
      getAllCourses(); // إضافة جلب الدورات
    }
  }, [aToken]);

  // ============================
  // COURSE MANAGEMENT FUNCTIONS
  // ============================

  // Get all courses
  const getAllCourses = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/courses`, {
        headers: { token: aToken },
      });

      if (data.success) {
        setCourses(data.courses || []);
        console.log("✅ Courses loaded:", (data.courses || []).length);
      } else {
        toast.error(data.message);
        setCourses([]);
      }
    } catch (error) {
      console.error("Error loading courses:", error);
      toast.error("فشل في تحميل الدورات: " + error.message);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // Create new course
  const createCourse = async (formData) => {
    try {
      setLoading(true);
      const { data } = await axios.post(
        `${backendUrl}/api/courses/admin/create`,
        formData,
        {
          headers: {
            token: aToken,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        toast.success("✅ تم إنشاء الدورة بنجاح");
        getAllCourses();
        return { success: true, course: data.course };
      }
      return { success: false, message: data.message };
    } catch (error) {
      toast.error("فشل في إنشاء الدورة: " + error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Update course
  const updateCourse = async (courseId, formData) => {
    try {
      setLoading(true);
      const { data } = await axios.put(
        `${backendUrl}/api/courses/admin/${courseId}`,
        formData,
        {
          headers: {
            token: aToken,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        toast.success("✅ تم تحديث الدورة بنجاح");
        getAllCourses();
        return { success: true, course: data.course };
      }
      return { success: false, message: data.message };
    } catch (error) {
      toast.error("فشل في تحديث الدورة: " + error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete course
  const deleteCourse = async (courseId) => {
    try {
      setLoading(true);
      const { data } = await axios.delete(
        `${backendUrl}/api/courses/admin/${courseId}`,
        { headers: { token: aToken } }
      );

      if (data.success) {
        toast.success("✅ تم حذف الدورة بنجاح");
        getAllCourses();
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      toast.error("فشل في حذف الدورة: " + error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Add lesson to course
  const addLesson = async (courseId, formData) => {
    try {
      setLoading(true);
      const { data } = await axios.post(
        `${backendUrl}/api/courses/admin/${courseId}/lesson`,
        formData,
        {
          headers: {
            token: aToken,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        toast.success("✅ تم إضافة الدرس بنجاح");
        return { success: true, lesson: data.lesson };
      }
      return { success: false, message: data.message };
    } catch (error) {
      toast.error("فشل في إضافة الدرس: " + error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Toggle course publish status
  const toggleCourseStatus = async (courseId, currentStatus) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/courses/admin/${courseId}`,
        { isPublished: !currentStatus },
        { headers: { token: aToken } }
      );

      if (data.success) {
        toast.success(`✅ تم ${!currentStatus ? "نشر" : "إخفاء"} الدورة`);
        getAllCourses();
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      toast.error("فشل في تغيير حالة الدورة: " + error.message);
      return { success: false, error: error.message };
    }
  };

  // Get course by ID
  const getCourseById = async (courseId) => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/courses/${courseId}`,
        {
          headers: { token: aToken },
        }
      );

      if (data.success) {
        return { success: true, course: data.course };
      }
      return { success: false, message: data.message };
    } catch (error) {
      console.error("Error getting course:", error);
      return { success: false, error: error.message };
    }
  };

  // ============================
  // SERVICES MANAGEMENT FUNCTIONS
  // ============================

  // Get all medical services
  const getAllServices = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/admin/services`, {
        headers: { token: aToken },
      });

      if (data.success) {
        setServices(data.services || []);
        console.log("✅ Services loaded:", (data.services || []).length);
      } else {
        toast.error(data.message);
        setServices([]);
      }
    } catch (error) {
      console.error("Error loading services:", error);
      toast.error("فشل في تحميل الخدمات: " + error.message);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  // Change service availability
  const changeServiceAvailability = async (serviceId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/change-service-availability`,
        { serviceId },
        { headers: { token: aToken } }
      );

      if (data.success) {
        toast.success(data.message);
        getAllServices();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Delete service
  const deleteService = async (serviceId) => {
    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/admin/delete-service/${serviceId}`,
        { headers: { token: aToken } }
      );

      if (data.success) {
        toast.success("✅ تم حذف الخدمة بنجاح");
        getAllServices();
      }
    } catch (error) {
      toast.error("فشل في حذف الخدمة: " + error.message);
    }
  };

  // ============================
  // APPOINTMENTS MANAGEMENT FUNCTIONS
  // ============================

  // Get all appointments
  const getAllAppointments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/admin/appointments`, {
        headers: { token: aToken },
      });

      if (data.success) {
        setAppointments(data.appointments || []);
        console.log(
          "✅ Appointments loaded:",
          (data.appointments || []).length
        );
      } else {
        toast.error(data.message);
        setAppointments([]);
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
      toast.error("فشل في تحميل المواعيد: " + error.message);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Get blocked slots
  const getBlockedSlots = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/admin/blocked-slots`,
        {
          headers: { token: aToken },
        }
      );

      if (data.success) {
        setBlockedSlots(data.blockedSlots || []);
        console.log(
          "✅ Blocked slots loaded:",
          (data.blockedSlots || []).length
        );
      } else {
        setBlockedSlots([]);
      }
    } catch (error) {
      console.error("Error loading blocked slots:", error);
      setBlockedSlots([]);
    }
  };

  // Block time slot
  const blockTimeSlot = async (date, time, reason = "") => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/block-slot`,
        { date, time, reason },
        { headers: { token: aToken } }
      );

      if (data.success) {
        toast.success("✅ تم حظر الموعد بنجاح");
        getBlockedSlots();
        getAllAppointments();
        return { success: true };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error("فشل في حظر الموعد: " + error.message);
      return { success: false, error: error.message };
    }
  };

  // Block time slot range
  const blockTimeSlotRange = async (
    startDate,
    endDate,
    startTime,
    endTime,
    reason = ""
  ) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/block-slot-range`,
        { startDate, endDate, startTime, endTime, reason },
        { headers: { token: aToken } }
      );

      if (data.success) {
        toast.success(`✅ تم حظر ${data.blockedCount || 0} موعد بنجاح`);
        getBlockedSlots();
        getAllAppointments();
        return { success: true, blockedCount: data.blockedCount };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error("فشل في حظر المواعيد: " + error.message);
      return { success: false, error: error.message };
    }
  };

  // Unblock time slot
  const unblockTimeSlot = async (slotId) => {
    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/admin/unblock-slot/${slotId}`,
        { headers: { token: aToken } }
      );

      if (data.success) {
        toast.success("✅ تم إلغاء حظر الموعد بنجاح");
        getBlockedSlots();
        getAllAppointments();
        return { success: true };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error("فشل في إلغاء حظر الموعد: " + error.message);
      return { success: false, error: error.message };
    }
  };

  // Update appointment status with email confirmation
  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      console.log("=== UPDATING APPOINTMENT STATUS ===");
      console.log("Appointment ID:", appointmentId);
      console.log("New Status:", status);

      const { data } = await axios.post(
        `${backendUrl}/api/admin/update-appointment-status`,
        {
          appointmentId,
          status,
          sendEmail: status === "confirmed", // Send email only when confirming
        },
        { headers: { token: aToken } }
      );

      if (data.success) {
        // Show appropriate success message
        if (status === "confirmed" && data.emailSent) {
          toast.success("✅ تم تأكيد الموعد وإرسال بريد التأكيد للمريض");
        } else if (status === "confirmed" && !data.emailSent) {
          toast.warning(
            "✅ تم تأكيد الموعد (لم يتم إرسال البريد - " +
              (data.emailError || "خطأ غير معروف") +
              ")"
          );
        } else {
          toast.success(
            `✅ تم تحديث حالة الموعد إلى ${getStatusTextAr(status)}`
          );
        }

        // Refresh appointments list to get updated data
        await getAllAppointments();

        return {
          success: true,
          emailSent: data.emailSent,
          appointment: data.appointment,
        };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error(
        "فشل في تحديث الموعد: " +
          (error.response?.data?.message || error.message)
      );
      return { success: false, error: error.message };
    }
  };

  // Get appointment statistics
  const getAppointmentStats = () => {
    const stats = {
      total: (appointments || []).length,
      pending: (appointments || []).filter((a) => a?.status === "pending")
        .length,
      confirmed: (appointments || []).filter((a) => a?.status === "confirmed")
        .length,
      completed: (appointments || []).filter((a) => a?.status === "completed")
        .length,
      cancelled: (appointments || []).filter((a) => a?.status === "cancelled")
        .length,
      blocked: (appointments || []).filter((a) => a?.status === "blocked")
        .length,
      paid: (appointments || []).filter((a) => a?.paid).length,
      unpaid: (appointments || []).filter((a) => !a?.paid).length,
    };

    return stats;
  };

  // ============================
  // HELPER FUNCTIONS
  // ============================

  // Helper function to get Arabic status text
  const getStatusTextAr = (status) => {
    switch (status) {
      case "pending":
        return "قيد الانتظار";
      case "confirmed":
        return "مؤكد";
      case "completed":
        return "مكتمل";
      case "cancelled":
        return "ملغي";
      case "blocked":
        return "محجوز (ممنوع)";
      default:
        return status;
    }
  };

  // Get status color for UI
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "confirmed":
        return "bg-green-100 text-green-700 border-green-200";
      case "completed":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      case "blocked":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Filter appointments by status
  const filterAppointmentsByStatus = (status) => {
    if (status === "all") return appointments || [];
    return (appointments || []).filter(
      (appointment) => appointment.status === status
    );
  };

  // Search appointments
  const searchAppointments = (searchTerm) => {
    return (appointments || []).filter(
      (appointment) =>
        appointment.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.phone?.includes(searchTerm) ||
        appointment.serviceId?.title_ar
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        appointment.serviceId?.title
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  };

  // ============================
  // AUTH FUNCTIONS
  // ============================

  // Login function
  const adminLogin = async (email, password) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/admin/login`, {
        email,
        password,
      });

      if (data.success) {
        localStorage.setItem("aToken", data.token);
        setAToken(data.token);
        toast.success("✅ تم تسجيل الدخول بنجاح");
        return { success: true };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || error.message);
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const adminLogout = () => {
    localStorage.removeItem("aToken");
    setAToken("");
    setServices([]);
    setAppointments([]);
    setBlockedSlots([]);
    setCourses([]); // إضافة تنظيف الدورات
    toast.success("✅ تم تسجيل الخروج بنجاح");
  };

  const value = {
    // Authentication
    aToken,
    setAToken,
    backendUrl,
    loading,
    adminLogin,
    adminLogout,

    // Services
    services,
    getAllServices,
    changeServiceAvailability,
    deleteService,

    // Appointments
    appointments,
    blockedSlots,
    getAllAppointments,
    getBlockedSlots,
    blockTimeSlot,
    blockTimeSlotRange,
    unblockTimeSlot,
    updateAppointmentStatus,
    getAppointmentStats,
    getStatusTextAr,
    getStatusColor,
    filterAppointmentsByStatus,
    searchAppointments,

    // Courses
    courses,
    getAllCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    addLesson,
    toggleCourseStatus,
    getCourseById,
  };

  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;
