/* eslint-disable no-unused-vars */
// pages/Admin/BlockSlots.jsx
import React, { useState, useContext, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminContext } from "../../context/AdminContext";
import {
  Calendar,
  Clock,
  Lock,
  Trash2,
  AlertCircle,
  RefreshCw,
  CheckCircle,
} from "lucide-react";

// Format "YYYY-MM-DD" → "الجمعة، 25 أبريل 2026"
const formatDateAr = (isoDate) => {
  if (!isoDate) return isoDate;
  try {
    const MONTHS = [
      "يناير",
      "فبراير",
      "مارس",
      "أبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ];
    const DAYS = [
      "الأحد",
      "الاثنين",
      "الثلاثاء",
      "الأربعاء",
      "الخميس",
      "الجمعة",
      "السبت",
    ];
    const d = new Date(isoDate + "T12:00:00");
    return `${DAYS[d.getDay()]}، ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return isoDate;
  }
};

const BlockSlots = () => {
  const {
    blockTimeSlotRange,
    getBlockedSlots,
    unblockTimeSlot,
    blockedSlots,
    loading: ctxLoading,
  } = useContext(AdminContext);

  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [unblocking, setUnblocking] = useState(null); // slotId being unblocked

  // Generate Arabic time options 10:00 → 20:30
  const timeOptions = [];
  for (let h = 10; h < 21; h++) {
    for (let m = 0; m < 60; m += 30) {
      const d = new Date();
      d.setHours(h, m, 0, 0);
      timeOptions.push(
        d
          .toLocaleTimeString("ar-EG", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
          .replace("AM", "ص")
          .replace("PM", "م"),
      );
    }
  }

  useEffect(() => {
    getBlockedSlots();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await getBlockedSlots();
    setRefreshing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await blockTimeSlotRange({
        startDate: formData.startDate,
        endDate: formData.endDate || formData.startDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        reason: formData.reason,
      });
      if (result?.success) {
        setFormData({
          startDate: "",
          endDate: "",
          startTime: "",
          endTime: "",
          reason: "",
        });
      }
    } catch (err) {
      console.error("Error blocking slots:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnblock = async (slotId) => {
    if (!window.confirm("هل أنت متأكد من إلغاء حظر هذا الموعد؟")) return;
    setUnblocking(slotId);
    await unblockTimeSlot(slotId);
    setUnblocking(null);
  };

  // Normalize blockedSlots — may be array or object
  const slotsArray = Array.isArray(blockedSlots)
    ? blockedSlots
    : typeof blockedSlots === "object" && blockedSlots !== null
      ? Object.entries(blockedSlots).flatMap(([date, times]) =>
          Array.isArray(times)
            ? times.map((time, i) => ({
                _id: `${date}-${time}-${i}`,
                date,
                time,
              }))
            : [],
        )
      : [];

  // Group by date
  const groupedSlots = slotsArray.reduce((acc, slot) => {
    const key = slot.date || "unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(slot);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedSlots).sort();
  const totalSlots = slotsArray.length;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          إدارة حظر المواعيد
        </h1>
        <p className="text-gray-500 text-sm">
          حظر تواريخ وأوقات معينة لمنع المستخدمين من الحجز فيها
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Block Form ───────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-500" /> حظر نطاق جديد
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  تاريخ البداية *
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, startDate: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400/30 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  تاريخ النهاية <span className="text-gray-400">(اختياري)</span>
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  min={
                    formData.startDate || new Date().toISOString().split("T")[0]
                  }
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, endDate: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400/30 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  وقت البداية
                </label>
                <select
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      startTime: e.target.value,
                      endTime: "",
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400/30 text-sm"
                >
                  <option value="">كل الأوقات</option>
                  {timeOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  وقت النهاية
                </label>
                <select
                  value={formData.endTime}
                  disabled={!formData.startTime}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, endTime: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400/30 text-sm disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">كل الأوقات</option>
                  {timeOptions
                    .filter(
                      (t) =>
                        !formData.startTime ||
                        timeOptions.indexOf(t) >=
                          timeOptions.indexOf(formData.startTime),
                    )
                    .map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                سبب الحظر <span className="text-gray-400">(اختياري)</span>
              </label>
              <textarea
                value={formData.reason}
                rows={2}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, reason: e.target.value }))
                }
                placeholder="مثال: إجازة الدكتور، صيانة..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400/30 text-sm resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !formData.startDate}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 rounded-xl
                font-bold hover:from-red-600 hover:to-orange-600 transition-all disabled:opacity-60
                flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جارٍ الحظر...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>تأكيد الحظر</span>
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* ── Blocked Slots List ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              المواعيد المحظورة
              {totalSlots > 0 && (
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {totalSlots}
                </span>
              )}
            </h2>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              تحديث
            </button>
          </div>

          {ctxLoading && slotsArray.length === 0 ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-red-400 border-t-transparent" />
            </div>
          ) : sortedDates.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-14 h-14 mx-auto mb-3 text-green-300" />
              <p className="text-gray-500 font-medium">لا توجد مواعيد محظورة</p>
              <p className="text-gray-400 text-sm mt-1">
                استخدم النموذج المجاور لإضافة حظر
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[480px] overflow-y-auto pl-1">
              {sortedDates.map((date) => (
                <div
                  key={date}
                  className="border border-red-100 rounded-xl overflow-hidden"
                >
                  {/* Date header */}
                  <div className="bg-red-50 px-4 py-2.5 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="font-semibold text-red-800 text-sm">
                      {formatDateAr(date)}
                    </span>
                    <span className="mr-auto text-xs text-red-400 bg-red-100 px-2 py-0.5 rounded-full">
                      {groupedSlots[date].length} وقت
                    </span>
                  </div>

                  {/* Time slots */}
                  <div className="divide-y divide-gray-50">
                    {groupedSlots[date]
                      .sort((a, b) =>
                        (a.time || "").localeCompare(b.time || ""),
                      )
                      .map((slot) => (
                        <div
                          key={slot._id}
                          className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                              <Clock className="w-4 h-4 text-red-500" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 text-sm">
                                {slot.time}
                              </p>
                              {/* Support both 'reason' (BlockedSlot model) and 'notes' (old Appointment model) */}
                              {(slot.reason || slot.notes) && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {slot.reason || slot.notes}
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleUnblock(slot._id)}
                            disabled={unblocking === slot._id}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                              text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
                          >
                            {unblocking === slot._id ? (
                              <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                            إلغاء الحظر
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default BlockSlots;
