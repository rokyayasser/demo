/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { DoctorContext } from "../../context/DoctorContext";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiPhone,
  FiDollarSign,
  FiCheckCircle,
  FiPackage,
  FiMessageCircle,
  FiRefreshCw,
  FiChevronRight,
  FiChevronLeft,
} from "react-icons/fi";

const DoctorToday = () => {
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { backendUrl, dToken } = useContext(DoctorContext);

  // Format date for display
  const formatDateForDisplay = (date) => {
    return date.toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get Arabic date for API
  const getArabicDate = (date) => {
    return date.toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Navigation functions
  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    fetchDateAppointments(today);
  };

  const goToPreviousDay = () => {
    const previousDay = new Date(selectedDate);
    previousDay.setDate(previousDay.getDate() - 1);
    setSelectedDate(previousDay);
    fetchDateAppointments(previousDay);
  };

  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setSelectedDate(nextDay);
    fetchDateAppointments(nextDay);
  };

  const fetchDateAppointments = async (date) => {
    setLoading(true);
    try {
      const arabicDate = getArabicDate(date);

      const response = await axios.get(
        `${backendUrl}/api/doctor/appointments/${arabicDate}`,
        {
          headers: { token: dToken },
        }
      );

      console.log("Date appointments response:", response.data);

      if (response.data.success) {
        setTodayAppointments(response.data.appointments || []);
        setStats({
          total: response.data.total || 0,
          stats: response.data.byStatus || {},
        });
      } else {
        toast.error("فشل في تحميل المواعيد");
      }
    } catch (error) {
      console.error("Error fetching date appointments:", error);
      toast.error("فشل في تحميل المواعيد");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchDateAppointments(selectedDate);
    setTimeout(() => setRefreshing(false), 500);
  };

  useEffect(() => {
    goToToday(); // Load today's appointments on mount
  }, [dToken]);

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/doctor/appointments/${appointmentId}/status`,
        { status: newStatus },
        { headers: { token: dToken } }
      );

      if (response.data.success) {
        toast.success(`تم تحديث حالة الموعد`);
        refreshData(); // Refresh data after update
      }
    } catch (error) {
      toast.error("فشل في تحديث حالة الموعد");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "قيد الانتظار";
      case "confirmed":
        return "مؤكد";
      case "completed":
        return "مكتمل";
      case "cancelled":
        return "ملغي";
      default:
        return status;
    }
  };

  const formatTime = (time) => {
    if (!time) return "";
    return time.replace("ص", "ص").replace("م", "م");
  };

  const formatAmount = (amount) => {
    return amount ? `${amount.toLocaleString()} جنيه` : "غير محدد";
  };

  if (loading && !todayAppointments.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="text-gray-600">جارٍ تحميل مواعيد اليوم...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-500 rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">مواعيد اليوم</h1>
            <p className="opacity-90 mt-1">
              {formatDateForDisplay(selectedDate)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
            >
              <FiRefreshCw
                className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>

            <button
              onClick={goToToday}
              className="px-4 py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
            >
              اليوم
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
            <div className="text-2xl font-bold">{todayAppointments.length}</div>
            <div className="text-sm opacity-90">إجمالي المواعيد</div>
          </div>
          <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
            <div className="text-2xl font-bold">
              {todayAppointments.filter((a) => a.status === "confirmed").length}
            </div>
            <div className="text-sm opacity-90">مؤكدة</div>
          </div>
          <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
            <div className="text-2xl font-bold">
              {todayAppointments.filter((a) => a.status === "pending").length}
            </div>
            <div className="text-sm opacity-90">قيد الانتظار</div>
          </div>
          <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
            <div className="text-2xl font-bold">
              {todayAppointments.filter((a) => a.paid).length}
            </div>
            <div className="text-sm opacity-90">مدفوعة</div>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={goToPreviousDay}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <FiChevronRight className="w-5 h-5" />
          </button>

          <span className="text-lg font-medium">
            {formatDateForDisplay(selectedDate)}
          </span>

          <button
            onClick={goToNextDay}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Appointments List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {todayAppointments.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-white rounded-xl shadow">
            <FiCalendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">
              لا توجد مواعيد في هذا اليوم
            </h3>
            <p className="text-gray-500 mb-4">
              {formatDateForDisplay(selectedDate)}
            </p>
            <button
              onClick={goToToday}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              العودة لليوم
            </button>
          </div>
        ) : (
          todayAppointments.map((appointment) => (
            <motion.div
              key={appointment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
            >
              {/* Appointment Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-teal-100 rounded-full flex items-center justify-center">
                      <FiUser className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">
                        {appointment.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {appointment.email}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <FiClock className="text-blue-500" />
                      <span className="text-xl font-bold text-gray-800">
                        {formatTime(appointment.time)}
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {getStatusText(appointment.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="p-6">
                {/* Service Information - IMPROVED */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiPackage className="text-teal-500" />
                    <span className="font-medium text-gray-700">
                      الخدمة المطلوبة
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-gray-800 text-sm">
                        {appointment.service?.title_ar ||
                          appointment.service?.title ||
                          "خدمة غير محددة"}
                      </span>
                      <span className="text-primary font-bold">
                        {formatAmount(appointment.amount)}
                      </span>
                    </div>
                    {appointment.service?.category && (
                      <div className="text-xs text-gray-500">
                        التصنيف: {appointment.service.category}
                      </div>
                    )}
                    {appointment.service?.fees && (
                      <div className="text-xs text-gray-500 mt-1">
                        السعر الأصلي:{" "}
                        {appointment.service.fees.toLocaleString()} جنيه
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FiPhone className="text-green-500 flex-shrink-0" />
                    <div className="overflow-hidden">
                      <div className="text-xs text-gray-500">الهاتف</div>
                      <div className="font-medium truncate">
                        {appointment.phone || "لا يوجد"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FiDollarSign className="text-orange-500 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-gray-500">حالة الدفع</div>
                      <div className="font-medium">
                        {appointment.paid ? (
                          <span className="text-green-600">مدفوع ✓</span>
                        ) : (
                          <span className="text-yellow-600">غير مدفوع</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Patient Message */}
                {appointment.message && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FiMessageCircle className="text-blue-500" />
                      <span className="font-medium text-gray-700">
                        ملاحظات المريض
                      </span>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {appointment.message}
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {appointment.status === "pending" && (
                      <>
                        <button
                          onClick={() =>
                            handleStatusUpdate(appointment._id, "confirmed")
                          }
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 font-medium"
                        >
                          <FiCheckCircle className="w-5 h-5" />
                          تأكيد الموعد
                        </button>
                        <button
                          onClick={() =>
                            handleStatusUpdate(appointment._id, "cancelled")
                          }
                          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-2.5 rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-medium"
                        >
                          إلغاء الموعد
                        </button>
                      </>
                    )}

                    {appointment.status === "confirmed" && (
                      <button
                        onClick={() =>
                          handleStatusUpdate(appointment._id, "completed")
                        }
                        className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-2.5 rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all flex items-center justify-center gap-2 font-medium"
                      >
                        <FiCheckCircle className="w-5 h-5" />
                        إكمال الموعد
                      </button>
                    )}

                    {appointment.status === "completed" && (
                      <div className="flex-1 text-center p-2.5 bg-gray-100 text-gray-600 rounded-lg font-medium">
                        تم إكمال الموعد
                      </div>
                    )}

                    {appointment.status === "cancelled" && (
                      <div className="flex-1 text-center p-2.5 bg-red-50 text-red-600 rounded-lg font-medium">
                        تم إلغاء الموعد
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Appointment Footer */}
              <div className="px-6 py-3 bg-gray-50 rounded-b-xl border-t border-gray-200">
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>رقم الحجز: {appointment._id?.substring(0, 8)}...</span>
                  <span>
                    تم الحجز:{" "}
                    {new Date(appointment.createdAt).toLocaleTimeString(
                      "ar-EG",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default DoctorToday;
