/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { DoctorContext } from "../../context/DoctorContext";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Eye,
  Check,
  X,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";
import {
  formatArabicDate,
  formatTime,
  getStatusColor,
  getStatusText,
} from "../../utils/formatters";

const DoctorAppointments = () => {
  const { appointments, getAppointments, updateAppointmentStatus, loading } =
    useContext(DoctorContext);
  const navigate = useNavigate();

  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, [statusFilter, dateFilter]);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchTerm]);

  const loadAppointments = async () => {
    const filters = {
      status: statusFilter !== "all" ? statusFilter : undefined,
      date: dateFilter || undefined,
    };
    await getAppointments(filters);
  };

  const filterAppointments = () => {
    if (!appointments) return;
    let filtered = appointments;
    if (searchTerm) {
      filtered = filtered.filter(
        (appt) =>
          appt.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appt.phone?.includes(searchTerm),
      );
    }
    setFiltered(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAppointments();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleStatusUpdate = async (id, status) => {
    await updateAppointmentStatus(id, status);
  };

  const handleViewDetails = (id) => {
    navigate(`/doctor/appointments/${id}`);
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
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              جميع المواعيد
            </h1>
            <p className="text-gray-500">عرض وإدارة جميع مواعيد المرضى</p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            <span>تحديث</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="بحث بالاسم أو الهاتف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">قيد الانتظار</option>
              <option value="confirmed">مؤكدة</option>
              <option value="completed">مكتملة</option>
              <option value="cancelled">ملغية</option>
            </select>
          </div>

          <div className="relative">
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setDateFilter("");
            }}
            className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            مسح الفلاتر
          </button>
        </div>
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
              لا توجد مواعيد
            </h3>
            <p className="text-gray-500">
              لم يتم العثور على مواعيد تطابق البحث
            </p>
          </div>
        ) : (
          filtered.map((appointment, index) => (
            <motion.div
              key={appointment._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
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

                {/* Date & Time */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {formatArabicDate(appointment.date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {formatTime(appointment.time)}
                    </span>
                  </div>
                </div>

                {/* Service */}
                <div className="px-3 py-1 bg-gray-100 rounded-lg">
                  <span className="text-sm text-gray-600">
                    {appointment.service?.title_ar || "غير محدد"}
                  </span>
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
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
};

export default DoctorAppointments;
