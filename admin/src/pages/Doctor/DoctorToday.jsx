/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { DoctorContext } from "../../context/DoctorContext";
import { useNavigate } from "react-router-dom";
import { Clock, User, Phone, Calendar, Eye, Check, X } from "lucide-react";
import {
  formatTime,
  getStatusColor,
  getStatusText,
} from "../../utils/formatters";

const DoctorToday = () => {
  const {
    todayAppointments,
    getTodayAppointments,
    updateAppointmentStatus,
    loading,
  } = useContext(DoctorContext);
  const navigate = useNavigate();

  const [filtered, setFiltered] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    getTodayAppointments();
  }, []);

  useEffect(() => {
    if (statusFilter === "all") {
      setFiltered(todayAppointments);
    } else {
      setFiltered(todayAppointments.filter((a) => a.status === statusFilter));
    }
  }, [todayAppointments, statusFilter]);

  const handleStatusUpdate = async (id, status) => {
    await updateAppointmentStatus(id, status);
  };

  const handleViewDetails = (id) => {
    navigate(`/doctor/appointments/${id}`);
  };

  const stats = {
    total: todayAppointments.length,
    pending: todayAppointments.filter((a) => a.status === "pending").length,
    confirmed: todayAppointments.filter((a) => a.status === "confirmed").length,
    completed: todayAppointments.filter((a) => a.status === "completed").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl p-6 text-white"
      >
        <h1 className="text-2xl font-bold mb-2">مواعيد اليوم</h1>
        <p className="opacity-90">
          {new Date().toLocaleDateString("ar-EG", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/20 p-4 rounded-xl backdrop-blur">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm opacity-90">الإجمالي</div>
          </div>
          <div className="bg-white/20 p-4 rounded-xl backdrop-blur">
            <div className="text-2xl font-bold">{stats.pending}</div>
            <div className="text-sm opacity-90">قيد الانتظار</div>
          </div>
          <div className="bg-white/20 p-4 rounded-xl backdrop-blur">
            <div className="text-2xl font-bold">{stats.confirmed}</div>
            <div className="text-sm opacity-90">مؤكدة</div>
          </div>
          <div className="bg-white/20 p-4 rounded-xl backdrop-blur">
            <div className="text-2xl font-bold">{stats.completed}</div>
            <div className="text-sm opacity-90">مكتملة</div>
          </div>
        </div>
      </motion.div>

      {/* Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
      >
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">جميع المواعيد</option>
          <option value="pending">قيد الانتظار</option>
          <option value="confirmed">مؤكدة</option>
          <option value="completed">مكتملة</option>
        </select>
      </motion.div>

      {/* Appointments List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-bold text-gray-700 mb-2">
              لا توجد مواعيد اليوم
            </h3>
            <p className="text-gray-500">لم يتم حجز أي مواعيد لهذا اليوم</p>
          </div>
        ) : (
          filtered.map((appointment) => (
            <motion.div
              key={appointment._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Patient Info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">
                      {appointment.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Phone className="w-4 h-4" />
                      <span>{appointment.phone || "لا يوجد"}</span>
                    </div>
                  </div>
                </div>

                {/* Time & Service */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="font-bold text-gray-800">
                      {formatTime(appointment.time)}
                    </span>
                  </div>
                  <div className="px-3 py-1 bg-gray-100 rounded-lg">
                    <span className="text-sm text-gray-600">
                      {appointment.service?.title_ar || "غير محدد"}
                    </span>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                      appointment.status,
                    )}`}
                  >
                    {getStatusText(appointment.status)}
                  </span>

                  <button
                    onClick={() => handleViewDetails(appointment._id)}
                    className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                    title="عرض التفاصيل"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {appointment.status === "pending" && (
                    <>
                      <button
                        onClick={() =>
                          handleStatusUpdate(appointment._id, "confirmed")
                        }
                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                        title="تأكيد"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          handleStatusUpdate(appointment._id, "cancelled")
                        }
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        title="إلغاء"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {appointment.status === "confirmed" && (
                    <button
                      onClick={() =>
                        handleStatusUpdate(appointment._id, "completed")
                      }
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      title="إكمال"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Message */}
              {appointment.message && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">{appointment.message}</p>
                </div>
              )}
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
};

export default DoctorToday;
