/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  Phone,
  Mail,
  DollarSign,
  Eye,
  Check,
  X,
  RefreshCw,
  Lock,
  Unlock,
  Filter,
  Search,
  CalendarDays,
  Clock as ClockIcon,
  X as XIcon,
  CalendarRange,
} from "lucide-react";
import axios from "axios";

const AllAppointments = () => {
  const {
    appointments = [],
    aToken,
    backendUrl,
    getAllAppointments,
    updateAppointmentStatus,
  } = useContext(AdminContext);

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockDate, setBlockDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [showBlockedSlots, setShowBlockedSlots] = useState(false);
  const [availableTimes, setAvailableTimes] = useState([]);

  useEffect(() => {
    if (aToken) {
      getAllAppointments();
      fetchBlockedSlots();
    }
  }, [aToken]);

  useEffect(() => {
    if (blockDate) {
      fetchAvailableTimes(blockDate);
    }
  }, [blockDate]);

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
    exit: { opacity: 0, y: -20 },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
  };

  const cardVariants = {
    hover: {
      y: -5,
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.3 },
    },
  };

  const getStatusColor = (status, paid) => {
    if (status === "confirmed")
      return "bg-green-100 text-green-700 border-green-200";
    if (status === "cancelled") return "bg-red-100 text-red-700 border-red-200";
    if (status === "completed")
      return "bg-blue-100 text-blue-700 border-blue-200";
    if (status === "blocked")
      return "bg-gray-100 text-gray-700 border-gray-200";
    if (paid) return "bg-purple-100 text-purple-700 border-purple-200";
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-3 h-3" />;
      case "cancelled":
        return <XCircle className="w-3 h-3" />;
      case "completed":
        return <CheckCircle className="w-3 h-3" />;
      case "blocked":
        return <Lock className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "confirmed":
        return "مؤكد";
      case "cancelled":
        return "ملغي";
      case "completed":
        return "مكتمل";
      case "blocked":
        return "محجوز (ممنوع)";
      default:
        return "قيد الانتظار";
    }
  };

  const fetchBlockedSlots = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/admin/blocked-slots`,
        {
          headers: { token: aToken },
        }
      );

      if (data.success) {
        setBlockedSlots(data.blockedSlots);
      }
    } catch (error) {
      console.error("Error fetching blocked slots:", error);
    }
  };

  const fetchAvailableTimes = async (date) => {
    if (!date) return;

    try {
      const { data } = await axios.get(
        `${backendUrl}/api/appointments/available-slots/${date}`
      );

      if (data.success) {
        setAvailableTimes(data.slots.filter((slot) => slot.isAvailable));
      }
    } catch (error) {
      console.error("Error fetching available times:", error);
    }
  };
  // In the handleBlockSlot function in AllAppointments.jsx, update the axios call:

  const handleBlockSlot = async () => {
    if (!blockDate) {
      alert("يرجى اختيار تاريخ البداية");
      return;
    }

    try {
      // Ensure time is in Arabic format for the backend
      const formatTimeForBackend = (time) => {
        if (!time) return "";

        // If time is already in Arabic format (contains Arabic numerals), keep it
        if (
          time.includes("٠") ||
          time.includes("١") ||
          time.includes("٢") ||
          time.includes("٣") ||
          time.includes("٤") ||
          time.includes("٥") ||
          time.includes("٦") ||
          time.includes("٧") ||
          time.includes("٨") ||
          time.includes("٩") ||
          time.includes("ص") ||
          time.includes("م")
        ) {
          return time;
        }

        // Otherwise, convert English time to Arabic format
        // Example: "11:00 AM" -> "١١:٠٠ ص"
        const englishToArabic = {
          0: "٠",
          1: "١",
          2: "٢",
          3: "٣",
          4: "٤",
          5: "٥",
          6: "٦",
          7: "٧",
          8: "٨",
          9: "٩",
          AM: "ص",
          PM: "م",
          am: "ص",
          pm: "م",
        };

        let arabicTime = time;
        for (const [eng, arb] of Object.entries(englishToArabic)) {
          arabicTime = arabicTime.replace(new RegExp(eng, "g"), arb);
        }

        return arabicTime;
      };

      const formattedStartTime = formatTimeForBackend(startTime);
      const formattedEndTime = formatTimeForBackend(endTime);

      console.log("Sending to backend:", {
        startDate: blockDate,
        endDate: endDate || blockDate,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        reason: blockReason,
      });

      // Call the range endpoint
      const { data } = await axios.post(
        `${backendUrl}/api/admin/block-slot-range`,
        {
          startDate: blockDate,
          endDate: endDate || blockDate,
          startTime: formattedStartTime,
          endTime: formattedEndTime,
          reason: blockReason,
        },
        {
          headers: {
            token: aToken,
            "Content-Type": "application/json",
          },
        }
      );

      if (data.success) {
        alert(`✅ ${data.message}`);
        setShowBlockModal(false);
        resetBlockForm();
        fetchBlockedSlots();
        getAllAppointments();
      } else {
        let errorMsg = data.message || "فشل في حظر المواعيد";
        if (data.errors && data.errors.length > 0) {
          errorMsg += `\nأخطاء: ${data.errors.length}`;
          console.error("Blocking errors:", data.errors);
        }
        alert(`❌ ${errorMsg}`);
      }
    } catch (error) {
      console.error("Error blocking slots:", error);
      let errorMsg = "فشل في حظر المواعيد";
      if (error.response?.data?.message) {
        errorMsg += `: ${error.response.data.message}`;
      } else if (error.message) {
        errorMsg += `: ${error.message}`;
      }
      alert(errorMsg);
    }
  };
  const handleUnblockSlot = async (slotId) => {
    if (!window.confirm("هل أنت متأكد من إلغاء حظر هذا الموعد؟")) {
      return;
    }

    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/admin/unblock-slot/${slotId}`,
        { headers: { token: aToken } }
      );

      if (data.success) {
        alert("✅ تم إلغاء حظر الموعد بنجاح");
        fetchBlockedSlots();
        getAllAppointments();
      }
    } catch (error) {
      alert("فشل في إلغاء حظر الموعد: " + error.message);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    setIsUpdating(true);
    try {
      const result = await updateAppointmentStatus(appointmentId, newStatus);

      if (result.success) {
        if (selectedAppointment?._id === appointmentId) {
          setSelectedAppointment({ ...selectedAppointment, status: newStatus });
        }
        await getAllAppointments();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const viewAppointmentDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetails(true);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await getAllAppointments();
    await fetchBlockedSlots();
    setRefreshing(false);
  };

  const resetBlockForm = () => {
    setBlockDate("");
    setEndDate("");
    setStartTime("");
    setEndTime("");
    setBlockReason("");
  };

  // Filter appointments
  const filteredAppointments = appointments.filter((appointment) => {
    const matchesStatus =
      selectedStatus === "all" || appointment.status === selectedStatus;
    const matchesSearch =
      searchTerm === "" ||
      appointment.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.phone?.includes(searchTerm) ||
      appointment.serviceId?.title_ar
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Generate time options
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 10; hour < 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = new Date();
        time.setHours(hour, minute, 0, 0);
        const formattedTime = time
          .toLocaleTimeString("ar-EG", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
          .replace("AM", "ص")
          .replace("PM", "م");
        options.push(formattedTime);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Sort appointments by date (newest first)
  const sortedAppointments = [...filteredAppointments].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full max-w-7xl mx-auto p-4 sm:p-6"
      dir="rtl"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="mb-8 flex justify-between items-center flex-wrap gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
            جميع المواعيد
          </h1>
          <p className="text-textSoft text-sm sm:text-base">
            عرض وإدارة جميع حجوزات المرضى
          </p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowBlockModal(true)}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            <Lock className="w-4 h-4" />
            <span>حظر مواعيد</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowBlockedSlots(!showBlockedSlots)}
            className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>المواعيد المحجورة ({blockedSlots.length})</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            <span>تحديث</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-8 border border-borderLight"
      >
        <h2 className="text-lg sm:text-xl font-bold text-primary mb-4">
          فلترة المواعيد
        </h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Search className="w-4 h-4 text-textSoft" />
              <label className="text-textMain font-medium">بحث:</label>
            </div>
            <input
              type="text"
              placeholder="ابحث بالاسم، البريد، الهاتف، أو الخدمة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-borderLight rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-4 h-4 text-textSoft" />
              <label className="text-textMain font-medium">الحالة:</label>
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-3 border border-borderLight rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">قيد الانتظار</option>
              <option value="confirmed">مؤكدة</option>
              <option value="completed">مكتملة</option>
              <option value="cancelled">ملغية</option>
              <option value="blocked">محجورة</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Block Slot Modal */}
      <AnimatePresence>
        {showBlockModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowBlockModal(false);
              resetBlockForm();
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold">حظر مواعيد (نطاق)</h3>
                    <p className="opacity-90 text-sm">
                      يمكنك حظر نطاق من التواريخ والأوقات
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setShowBlockModal(false);
                      resetBlockForm();
                    }}
                    className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20"
                  >
                    ✕
                  </motion.button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date Range */}
                  <div className="bg-lightBg rounded-xl p-4 md:col-span-2">
                    <h4 className="font-bold text-primary mb-4 flex items-center gap-2">
                      <CalendarRange className="w-5 h-5" />
                      نطاق التواريخ
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-textMain mb-2">
                          تاريخ البداية *
                        </label>
                        <input
                          type="date"
                          value={blockDate}
                          onChange={(e) => setBlockDate(e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full p-3 border border-borderLight rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-textMain mb-2">
                          تاريخ النهاية (اختياري)
                        </label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          min={
                            blockDate || new Date().toISOString().split("T")[0]
                          }
                          className="w-full p-3 border border-borderLight rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <p className="text-xs text-textSoft mt-1">
                          إذا لم تحدد تاريخ النهاية، سيتم استخدام تاريخ البداية
                          فقط
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Time Range */}
                  <div className="bg-lightBg rounded-xl p-4 md:col-span-2">
                    <h4 className="font-bold text-primary mb-4 flex items-center gap-2">
                      <ClockIcon className="w-5 h-5" />
                      نطاق الأوقات (اختياري)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-textMain mb-2">
                          وقت البداية
                        </label>
                        <select
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full p-3 border border-borderLight rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="">كل الأوقات</option>
                          {timeOptions.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-textMain mb-2">
                          وقت النهاية
                        </label>
                        <select
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full p-3 border border-borderLight rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          disabled={!startTime}
                        >
                          <option value="">كل الأوقات</option>
                          {timeOptions
                            .filter((time) => {
                              if (!startTime) return true;
                              const startIndex = timeOptions.indexOf(startTime);
                              const timeIndex = timeOptions.indexOf(time);
                              return timeIndex >= startIndex;
                            })
                            .map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                    <p className="text-xs text-textSoft mt-2">
                      إذا لم تحدد نطاق الأوقات، سيتم حظر جميع الأوقات
                    </p>
                  </div>

                  {/* Reason */}
                  <div className="bg-lightBg rounded-xl p-4 md:col-span-2">
                    <h4 className="font-bold text-primary mb-4">
                      سبب الحظر (اختياري)
                    </h4>
                    <textarea
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      placeholder="مثال: إجازة الدكتور، صيانة، إلخ..."
                      rows="3"
                      className="w-full p-3 border border-borderLight rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Summary */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-bold text-blue-700 mb-2">ملخص الحظر:</h4>
                  <div className="text-sm text-blue-600">
                    <p>سوف يتم حظر المواعيد في:</p>
                    <ul className="list-disc pr-4 mt-1">
                      <li>
                        التاريخ: من {blockDate}
                        {endDate && ` إلى ${endDate}`}
                      </li>
                      {startTime && endTime ? (
                        <li>
                          الوقت: من {startTime} إلى {endTime}
                        </li>
                      ) : (
                        <li>الوقت: جميع الأوقات (10 ص - 9 م)</li>
                      )}
                      {blockReason && <li>السبب: {blockReason}</li>}
                    </ul>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-6 border-t border-borderLight">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleBlockSlot}
                      disabled={!blockDate}
                      className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Lock className="w-5 h-5" />
                      تأكيد الحظر
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setShowBlockModal(false);
                        resetBlockForm();
                      }}
                      className="px-6 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                    >
                      إلغاء
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blocked Slots Panel */}
      <AnimatePresence>
        {showBlockedSlots && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-yellow-700 flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  المواعيد المحجورة
                </h3>
                <p className="text-yellow-600 text-sm">
                  إجمالي {blockedSlots.length} موعد محجور
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowBlockedSlots(false)}
                className="text-yellow-600 hover:text-yellow-700 p-1"
              >
                ✕
              </motion.button>
            </div>

            {blockedSlots.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-yellow-500" />
                </div>
                <p className="text-yellow-600">لا توجد مواعيد محجورة</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {blockedSlots.slice(0, 12).map((slot) => (
                  <motion.div
                    key={slot._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white border border-yellow-300 rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-textMain flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-primary" />
                          {formatDate(slot.date)}
                        </p>
                        <p className="text-textSoft text-sm mt-1 flex items-center gap-2">
                          <ClockIcon className="w-3 h-3" />
                          {slot.time}
                        </p>
                        {slot.notes && (
                          <p className="text-sm text-gray-600 mt-2 border-t border-gray-100 pt-2">
                            {slot.notes}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          تم الحظر بواسطة: {slot.blockedBy || "الإدارة"}
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleUnblockSlot(slot._id)}
                        className="text-green-600 hover:text-green-700 p-1"
                        title="إلغاء الحظر"
                      >
                        <Unlock className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {blockedSlots.length > 12 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-yellow-600">
                  عرض 12 من أصل {blockedSlots.length} موعد محجور
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {[
          {
            label: "جميع المواعيد",
            value: appointments.length,
            color: "from-primary to-secondary",
            icon: "📅",
          },
          {
            label: "قيد الانتظار",
            value: appointments.filter((a) => a.status === "pending").length,
            color: "from-yellow-500 to-orange-500",
            icon: "⏳",
          },
          {
            label: "مؤكدة",
            value: appointments.filter((a) => a.status === "confirmed").length,
            color: "from-green-500 to-emerald-600",
            icon: "✅",
          },
          {
            label: "محجورة",
            value: appointments.filter((a) => a.status === "blocked").length,
            color: "from-gray-500 to-gray-600",
            icon: "🔒",
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            whileHover="hover"
            className={`bg-gradient-to-r ${stat.color} text-white rounded-2xl p-4 sm:p-6 shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl sm:text-3xl font-bold">{stat.value}</p>
                <p className="text-white/90 text-sm">{stat.label}</p>
              </div>
              <motion.span
                className="text-2xl sm:text-3xl"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                {stat.icon}
              </motion.span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Appointments Table */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl shadow-lg overflow-hidden border border-borderLight"
      >
        <div className="p-4 sm:p-6 border-b border-borderLight">
          <h2 className="text-lg sm:text-xl font-bold text-primary">
            قائمة المواعيد
          </h2>
          <p className="text-textSoft text-xs sm:text-sm">
            عرض {filteredAppointments.length} من أصل {appointments.length} موعد
          </p>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-lightBg">
              <tr className="text-right">
                <th className="py-3 px-4 text-textMain font-semibold text-sm">
                  #
                </th>
                <th className="py-3 px-4 text-textMain font-semibold text-sm">
                  المريض
                </th>
                <th className="py-3 px-4 text-textMain font-semibold text-sm">
                  الخدمة
                </th>
                <th className="py-3 px-4 text-textMain font-semibold text-sm">
                  التاريخ
                </th>
                <th className="py-3 px-4 text-textMain font-semibold text-sm">
                  الحالة
                </th>
                <th className="py-3 px-4 text-textMain font-semibold text-sm">
                  الدفع
                </th>
                <th className="py-3 px-4 text-textMain font-semibold text-sm">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {sortedAppointments.map((item, index) => (
                  <motion.tr
                    key={item._id}
                    variants={itemVariants}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`border-b border-borderLight hover:bg-lightBg/50 transition-colors ${
                      item.status === "blocked" ? "bg-gray-50" : ""
                    }`}
                  >
                    <td className="py-4 px-4 text-center text-sm">
                      {index + 1}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center"
                        >
                          <User className="w-4 h-4 text-primary" />
                        </motion.div>
                        <div>
                          <p className="font-medium text-textMain text-sm">
                            {item.name}
                          </p>
                          <p className="text-xs text-textSoft">{item.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <p className="font-medium text-textMain text-sm">
                        {item.serviceId?.title_ar || "غير متوفر"}
                      </p>
                      <p className="text-xs text-textSoft">
                        {item.serviceId?.category_ar}
                      </p>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-textSoft" />
                        <span className="text-xs">{item.date}</span>
                      </div>
                      {item.time && (
                        <p className="text-xs text-textSoft mt-1">
                          {item.time}
                        </p>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          item.status,
                          item.paid
                        )}`}
                      >
                        {getStatusIcon(item.status)}
                        {getStatusText(item.status)}
                      </motion.span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <DollarSign
                          className={`w-3 h-3 ${
                            item.paid ? "text-green-600" : "text-yellow-600"
                          }`}
                        />
                        <span
                          className={`text-xs font-medium ${
                            item.paid ? "text-green-600" : "text-yellow-600"
                          }`}
                        >
                          {item.paid ? "مدفوع ✓" : "غير مدفوع"}
                        </span>
                      </div>
                      <p className="text-xs text-primary font-bold mt-1">
                        {item.amount} جنيه
                      </p>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => viewAppointmentDetails(item)}
                          className="bg-primary/10 text-primary px-2 py-1.5 rounded-lg text-xs hover:bg-primary/20 transition-colors flex items-center gap-1 justify-center"
                        >
                          <Eye className="w-3 h-3" />
                          عرض التفاصيل
                        </motion.button>

                        {item.status === "pending" && (
                          <div className="flex gap-1">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() =>
                                handleStatusUpdate(item._id, "confirmed")
                              }
                              disabled={isUpdating}
                              className="flex-1 bg-green-500 text-white px-2 py-1.5 rounded-lg text-xs hover:bg-green-600 transition-colors flex items-center gap-1 justify-center disabled:opacity-50"
                            >
                              <Check className="w-3 h-3" />
                              تأكيد
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() =>
                                handleStatusUpdate(item._id, "cancelled")
                              }
                              disabled={isUpdating}
                              className="flex-1 bg-red-500 text-white px-2 py-1.5 rounded-lg text-xs hover:bg-red-600 transition-colors flex items-center gap-1 justify-center disabled:opacity-50"
                            >
                              <X className="w-3 h-3" />
                              إلغاء
                            </motion.button>
                          </div>
                        )}

                        {item.status === "confirmed" && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              handleStatusUpdate(item._id, "completed")
                            }
                            disabled={isUpdating}
                            className="bg-blue-500 text-white px-2 py-1.5 rounded-lg text-xs hover:bg-blue-600 transition-colors flex items-center gap-1 justify-center disabled:opacity-50"
                          >
                            <CheckCircle className="w-3 h-3" />
                            اكتمل
                          </motion.button>
                        )}

                        {item.status === "blocked" && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleUnblockSlot(item._id)}
                            className="bg-green-500 text-white px-2 py-1.5 rounded-lg text-xs hover:bg-green-600 transition-colors flex items-center gap-1 justify-center"
                          >
                            <Unlock className="w-3 h-3" />
                            إلغاء الحظر
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden">
          <AnimatePresence>
            {sortedAppointments.map((item, index) => (
              <motion.div
                key={item._id}
                variants={itemVariants}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`border-b border-borderLight p-4 hover:bg-lightBg/50 transition-colors ${
                  item.status === "blocked" ? "bg-gray-50" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center"
                    >
                      <User className="w-5 h-5 text-primary" />
                    </motion.div>
                    <div>
                      <p className="font-medium text-textMain">{item.name}</p>
                      <p className="text-xs text-textSoft">{item.email}</p>
                    </div>
                  </div>
                  <span className="text-sm text-textSoft">#{index + 1}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-textSoft mb-1">الخدمة</p>
                    <p className="font-medium text-sm">
                      {item.serviceId?.title_ar || "غير متوفر"}
                    </p>
                    <p className="text-xs text-textSoft">
                      {item.serviceId?.category_ar}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-textSoft mb-1">التاريخ</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-textSoft" />
                      <span className="text-sm">{item.date}</span>
                    </div>
                    {item.time && (
                      <p className="text-xs text-textSoft mt-1">{item.time}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-textSoft mb-1">الحالة</p>
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        item.status,
                        item.paid
                      )}`}
                    >
                      {getStatusIcon(item.status)}
                      {getStatusText(item.status)}
                    </motion.span>
                  </div>
                  <div>
                    <p className="text-xs text-textSoft mb-1">الدفع</p>
                    <div className="flex items-center gap-2">
                      <DollarSign
                        className={`w-3 h-3 ${
                          item.paid ? "text-green-600" : "text-yellow-600"
                        }`}
                      />
                      <span
                        className={`text-xs font-medium ${
                          item.paid ? "text-green-600" : "text-yellow-600"
                        }`}
                      >
                        {item.paid ? "مدفوع ✓" : "غير مدفوع"}
                      </span>
                    </div>
                    <p className="text-sm text-primary font-bold mt-1">
                      {item.amount} جنيه
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => viewAppointmentDetails(item)}
                    className="bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm hover:bg-primary/20 transition-colors flex items-center gap-2 justify-center"
                  >
                    <Eye className="w-4 h-4" />
                    عرض التفاصيل
                  </motion.button>

                  {item.status === "pending" && (
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          handleStatusUpdate(item._id, "confirmed")
                        }
                        disabled={isUpdating}
                        className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition-colors flex items-center gap-2 justify-center disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        تأكيد
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          handleStatusUpdate(item._id, "cancelled")
                        }
                        disabled={isUpdating}
                        className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors flex items-center gap-2 justify-center disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        إلغاء
                      </motion.button>
                    </div>
                  )}

                  {item.status === "confirmed" && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStatusUpdate(item._id, "completed")}
                      disabled={isUpdating}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors flex items-center gap-2 justify-center disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      اكتمل
                    </motion.button>
                  )}

                  {item.status === "blocked" && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleUnblockSlot(item._id)}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition-colors flex items-center gap-2 justify-center"
                    >
                      <Unlock className="w-4 h-4" />
                      إلغاء الحظر
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Empty State */}
      {filteredAppointments.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-lg p-8 text-center"
        >
          <div className="w-24 h-24 bg-lightBg rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-12 h-12 text-textSoft" />
          </div>
          <h3 className="text-lg font-bold text-textMain mb-2">
            لا توجد مواعيد
          </h3>
          <p className="text-textSoft">لم يتم العثور على مواعيد تطابق بحثك</p>
        </motion.div>
      )}

      {/* Appointment Details Modal - Keep existing structure */}
      <AnimatePresence>
        {showDetails && selectedAppointment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div
                className={`p-6 text-white ${
                  selectedAppointment.status === "blocked"
                    ? "bg-gradient-to-r from-gray-600 to-gray-700"
                    : "bg-gradient-to-r from-primary to-secondary"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold">تفاصيل الحجز</h3>
                    <p className="opacity-90 text-sm">
                      رقم الحجز: {selectedAppointment._id?.substring(0, 8)}...
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowDetails(false)}
                    className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20"
                  >
                    ✕
                  </motion.button>
                </div>
              </div>

              {/* Content - Keep existing content structure */}
              {/* ... rest of the details modal content remains the same ... */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AllAppointments;
