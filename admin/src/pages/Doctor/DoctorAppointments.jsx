/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { DoctorContext } from "../../context/DoctorContext";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FiSearch,
  FiCalendar,
  FiClock,
  FiUser,
  FiPhone,
  FiDollarSign,
  FiFilter,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiEye,
} from "react-icons/fi";

const DoctorAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const { backendUrl, dToken } = useContext(DoctorContext);

  // Add this ref to track initial fetch
  const hasFetchedRef = useRef(false);
  // Add ref to prevent multiple simultaneous calls
  const isFetchingRef = useRef(false);

  const statusOptions = [
    { value: "all", label: "جميع الحالات" },
    { value: "pending", label: "قيد الانتظار" },
    { value: "confirmed", label: "مؤكد" },
    { value: "completed", label: "مكتمل" },
    { value: "cancelled", label: "ملغي" },
  ];

  const fetchAppointments = async (page = 1) => {
    // Prevent multiple simultaneous calls
    if (isFetchingRef.current) {
      console.log("Fetch already in progress, skipping...");
      return;
    }

    setLoading(true);
    isFetchingRef.current = true;

    try {
      const params = {
        page,
        limit: pagination.limit,
      };

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      if (dateFilter) {
        console.log(`Using date filter: "${dateFilter}"`);
        params.date = dateFilter;
      }

      console.log("Fetching appointments with params:", params);

      const response = await axios.get(
        `${backendUrl}/api/doctor/appointments`,
        {
          params,
          headers: { token: dToken },
        }
      );

      console.log("API Response:", response.data);

      if (response.data.success) {
        const fetchedAppointments = response.data.appointments || [];
        setAppointments(fetchedAppointments);
        setFilteredAppointments(fetchedAppointments);
        setPagination({
          page: response.data.currentPage,
          limit: pagination.limit,
          total: response.data.totalCount,
          totalPages: response.data.totalPages,
        });

        // Show toast only if we have appointments and it's not an initial silent load
        if (hasFetchedRef.current && fetchedAppointments.length > 0) {
          toast.success(`تم تحميل ${fetchedAppointments.length} موعد`);
        } else if (dateFilter && fetchedAppointments.length === 0) {
          toast.info(`لم يتم العثور على مواعيد للتاريخ: ${dateFilter}`);
        }

        // Mark that initial fetch has completed
        hasFetchedRef.current = true;
      } else {
        toast.error("فشل في تحميل المواعيد: " + response.data.message);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("فشل في تحميل المواعيد");
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchAppointments(pagination.page);
    setTimeout(() => setRefreshing(false), 500);
  };

  // Modify useEffect to use cleanup function
  useEffect(() => {
    if (!dToken) return;

    // Create an AbortController to cancel pending requests
    const abortController = new AbortController();

    // Use a timeout to debounce rapid calls (like from Strict Mode)
    const fetchTimer = setTimeout(() => {
      fetchAppointments(1);
    }, 100);

    return () => {
      abortController.abort();
      clearTimeout(fetchTimer);
    };
  }, [statusFilter, dateFilter, dToken]);
  useEffect(() => {
    let filtered = appointments;

    if (searchTerm) {
      filtered = filtered.filter(
        (appt) =>
          appt.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appt.phone?.includes(searchTerm) ||
          appt.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAppointments(filtered);
  }, [searchTerm, appointments]);

  const handleDateFilterChange = (e) => {
    const value = e.target.value;
    setDateInput(value);
    setDateFilter(value || "");
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/doctor/appointments/${appointmentId}/status`,
        { status: newStatus },
        { headers: { token: dToken } }
      );

      if (response.data.success) {
        toast.success(`تم تحديث حالة الموعد`);
        refreshData();
      }
    } catch (error) {
      toast.error("فشل في تحديث حالة الموعد");
    }
  };

  const handleViewDetails = (appointmentId) => {
    navigate(`/doctor/appointments/${appointmentId}`);
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

  const formatArabicDate = (arabicDate) => {
    if (!arabicDate) return "غير محدد";

    if (
      arabicDate.includes("يناير") ||
      arabicDate.includes("ديسمبر") ||
      arabicDate.includes("سبتمبر") ||
      arabicDate.includes("أكتوبر")
    ) {
      return arabicDate;
    }

    try {
      const date = new Date(arabicDate);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("ar-EG", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
    } catch (error) {
      // If parsing fails, return as-is
    }

    return arabicDate;
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchAppointments(newPage);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateInput("");
    setDateFilter("");
  };

  if (loading && appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="text-gray-600">جارٍ تحميل المواعيد...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">جميع المواعيد</h1>
            <p className="text-gray-600">عرض وإدارة جميع مواعيد المرضى</p>
            {dateFilter && (
              <p className="text-sm text-blue-600 mt-1">
                تصفية حسب التاريخ: {dateInput}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-lg font-bold text-gray-800">
              {pagination.total} موعد
            </div>
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <FiRefreshCw
                className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="بحث بالاسم أو الهاتف أو البريد..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <FiFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <FiCalendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={dateInput}
              onChange={handleDateFilterChange}
              className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="اختر تاريخاً للتصفية"
            />
          </div>

          <button
            onClick={clearFilters}
            className="p-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <span>مسح الفلاتر</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statusOptions.slice(1).map((status) => (
            <div
              key={status.value}
              className={`p-4 rounded-lg border ${getStatusColor(
                status.value
              )}`}
            >
              <div className="text-2xl font-bold">
                {
                  appointments.filter((appt) => appt.status === status.value)
                    .length
                }
              </div>
              <div className="text-sm">{status.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <FiCalendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">
              لا توجد مواعيد
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || dateInput || statusFilter !== "all"
                ? "لم يتم العثور على مواعيد تطابق البحث"
                : "لم يتم حجز أي مواعيد حتى الآن"}
            </p>
            {(searchTerm || dateInput || statusFilter !== "all") && (
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                عرض جميع المواعيد
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4 text-right text-sm font-semibold text-gray-600">
                      المريض
                    </th>
                    <th className="p-4 text-right text-sm font-semibold text-gray-600">
                      التاريخ والوقت
                    </th>
                    <th className="p-4 text-right text-sm font-semibold text-gray-600">
                      الخدمة
                    </th>
                    <th className="p-4 text-right text-sm font-semibold text-gray-600">
                      الحالة
                    </th>
                    <th className="p-4 text-right text-sm font-semibold text-gray-600">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAppointments.map((appointment) => (
                    <tr
                      key={appointment._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <FiUser className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-800">
                              {appointment.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {appointment.phone || "لا يوجد"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-right">
                          <div className="font-medium text-gray-800">
                            {formatArabicDate(appointment.date)}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <FiClock className="w-4 h-4" />
                            {appointment.time || "غير محدد"}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-right">
                          <div className="font-medium text-gray-800">
                            {appointment.service?.title_ar ||
                              appointment.service?.title ||
                              "غير محدد"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.amount
                              ? `${appointment.amount} جنيه`
                              : "غير محدد"}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {getStatusText(appointment.status)}
                        </span>
                        {appointment.paid && (
                          <div className="text-xs text-green-600 mt-1">
                            ✓ مدفوع
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {/* View Details Button - ALWAYS VISIBLE */}
                          <button
                            onClick={() => handleViewDetails(appointment._id)}
                            className="px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all text-sm flex items-center gap-1"
                          >
                            <FiEye className="w-4 h-4" />
                            عرض التفاصيل
                          </button>

                          {appointment.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleStatusUpdate(
                                    appointment._id,
                                    "confirmed"
                                  )
                                }
                                className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all text-sm"
                              >
                                تأكيد
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusUpdate(
                                    appointment._id,
                                    "cancelled"
                                  )
                                }
                                className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all text-sm"
                              >
                                إلغاء
                              </button>
                            </>
                          )}
                          {appointment.status === "confirmed" && (
                            <button
                              onClick={() =>
                                handleStatusUpdate(appointment._id, "completed")
                              }
                              className="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all text-sm flex items-center gap-1"
                            >
                              <FiCheckCircle className="w-4 h-4" />
                              إكمال
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  عرض {filteredAppointments.length} من أصل {pagination.total}{" "}
                  موعد
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    السابق
                  </button>
                  <span className="px-4 py-2 text-sm">
                    صفحة {pagination.page} من {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    التالي
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointments;
