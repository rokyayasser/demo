/* eslint-disable no-unused-vars */
// pages/Doctor/DoctorCalendar.jsx
import React, { useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Clock, X, Check } from "lucide-react";
import { DoctorContext } from "../../context/DoctorContext";
// Robust time formatter — handles any format returned from backend
const safeFormatTime = (time) => {
  if (!time) return "";
  const t = String(time).trim();
  // Already Arabic (contains ص or م)
  if (t.includes("ص") || t.includes("م")) return t;
  // Convert "HH:MM" or "HH:MM AM/PM" to Arabic
  try {
    const clean = t.replace(/\s*(AM|PM|am|pm)/i, "").trim();
    const [h, m] = clean.split(":").map(Number);
    const isPM = /pm/i.test(t);
    const hours = isPM && h !== 12 ? h + 12 : !isPM && h === 12 ? 0 : h;
    const d = new Date();
    d.setHours(hours, m || 0, 0, 0);
    return d
      .toLocaleTimeString("ar-EG", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace("AM", "ص")
      .replace("PM", "م");
  } catch {
    return t;
  }
};
import { useNavigate } from "react-router-dom";

const DAYS_AR = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];
const MONTHS_AR = [
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

const STATUS_CLS = {
  pending: "bg-yellow-400",
  confirmed: "bg-green-500",
  completed: "bg-blue-500",
  cancelled: "bg-red-400",
  no_show: "bg-gray-400",
};
const STATUS_AR = {
  pending: "انتظار",
  confirmed: "مؤكد",
  completed: "مكتمل",
  cancelled: "ملغي",
  no_show: "لم يحضر",
};

const DoctorCalendar = () => {
  const { getAppointmentsByDate, updateAppointmentStatus } =
    useContext(DoctorContext);
  const navigate = useNavigate();

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selected, setSelected] = useState(null);
  const [dayApts, setDayApts] = useState([]);
  const [dayLoading, setDayLoading] = useState(false);
  const [dotMap, setDotMap] = useState({});

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // ── Navigation: LEFT = next, RIGHT = prev ──────────────────────────────────
  const goPrev = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const goNext = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  const formatKey = (d) => `${year}-${month + 1}-${d}`;
  const formatDateStr = (d) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const isToday = (d) =>
    d === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const handleDayClick = async (d) => {
    const key = formatKey(d);
    setSelected(key);
    setDayLoading(true);
    try {
      const apts = await getAppointmentsByDate(formatDateStr(d));
      setDayApts(Array.isArray(apts) ? apts : []);
      setDotMap((p) => ({
        ...p,
        [key]: Array.isArray(apts) ? apts.length : 0,
      }));
    } finally {
      setDayLoading(false);
    }
  };

  const handleStatusUpdate = async (aptId, status) => {
    await updateAppointmentStatus(aptId, status);
    // Refresh panel
    if (selected) {
      const [y, m, d] = selected.split("-");
      const apts = await getAppointmentsByDate(formatDateStr(Number(d)));
      setDayApts(Array.isArray(apts) ? apts : []);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-gray-800">التقويم</h1>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Calendar grid ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-1"
        >
          {/* Month nav — RIGHT=prev, LEFT=next */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={goPrev}
              className="p-2 hover:bg-gray-100 rounded-xl transition"
              title="الشهر السابق"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-lg font-bold text-gray-800">
              {MONTHS_AR[month]} {year}
            </h2>
            <button
              onClick={goNext}
              className="p-2 hover:bg-gray-100 rounded-xl transition"
              title="الشهر التالي"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Day headers — full Arabic names */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS_AR.map((d) => (
              <div
                key={d}
                className="text-center text-xs font-semibold text-gray-400 py-2 truncate px-0.5"
              >
                {d.replace("ال", "")}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (!d) return <div key={`e-${i}`} />;
              const key = formatKey(d);
              const active = selected === key;
              const tod = isToday(d);
              const dots = dotMap[key] || 0;
              return (
                <button
                  key={key}
                  onClick={() => handleDayClick(d)}
                  className={`relative flex flex-col items-center justify-center
                    h-11 w-full rounded-xl text-sm font-medium transition-all
                    ${
                      active
                        ? "bg-blue-600 text-white shadow-md"
                        : tod
                          ? "bg-blue-50 text-blue-700 ring-2 ring-blue-300"
                          : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  {d}
                  {dots > 0 && (
                    <span
                      className={`absolute bottom-1 w-1.5 h-1.5 rounded-full
                      ${active ? "bg-white" : "bg-blue-500"}`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-5 pt-4 border-t border-gray-100 text-xs text-gray-500">
            {Object.entries(STATUS_AR).map(([k, v]) => (
              <div key={k} className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${STATUS_CLS[k]}`} />
                {v}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Day details panel ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 w-full lg:w-80"
        >
          <h3 className="font-bold text-gray-700 mb-4 text-base">
            {selected
              ? (() => {
                  const [y, m, d] = selected.split("-");
                  return `${d} ${MONTHS_AR[+m - 1]} ${y}`;
                })()
              : "اختر يوماً من التقويم"}
          </h3>

          {dayLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-500 border-t-transparent" />
            </div>
          ) : !selected ? (
            <p className="text-gray-400 text-sm text-center py-10">
              انقر على أي يوم لعرض مواعيده
            </p>
          ) : dayApts.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">
              لا توجد مواعيد هذا اليوم
            </p>
          ) : (
            <div className="space-y-3 max-h-[520px] overflow-y-auto pl-1">
              {dayApts.map((apt) => (
                <div
                  key={apt._id}
                  className="border border-gray-100 rounded-xl p-3 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-sm text-gray-800 truncate max-w-[160px]">
                      {apt.name ||
                        `${apt.firstName || ""} ${apt.lastName || ""}`.trim() ||
                        "—"}
                    </span>
                    <span
                      className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full
                      ${STATUS_CLS[apt.status] ? STATUS_CLS[apt.status].replace("bg-", "bg-").replace("500", "100") : "bg-gray-100"}
                      text-gray-700`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${STATUS_CLS[apt.status] || "bg-gray-400"}`}
                      />
                      {STATUS_AR[apt.status] || apt.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <Clock className="w-3 h-3" />
                    <span>{safeFormatTime(apt.time)}</span>
                    <span>·</span>
                    <span className="truncate">
                      {apt.service?.title_ar || apt.category || "استشارة"}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() =>
                        navigate(`/doctor/appointments/${apt._id}`)
                      }
                      className="flex-1 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium"
                    >
                      تفاصيل
                    </button>
                    {apt.status === "pending" && (
                      <button
                        onClick={() => handleStatusUpdate(apt._id, "confirmed")}
                        className="flex-1 py-1.5 text-xs bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition font-medium"
                      >
                        تأكيد
                      </button>
                    )}
                    {apt.status === "confirmed" && (
                      <button
                        onClick={() => handleStatusUpdate(apt._id, "completed")}
                        className="flex-1 py-1.5 text-xs bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition font-medium"
                      >
                        إكمال
                      </button>
                    )}
                    {(apt.status === "pending" ||
                      apt.status === "confirmed") && (
                      <button
                        onClick={() => handleStatusUpdate(apt._id, "cancelled")}
                        className="px-2 py-1.5 text-xs bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
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

export default DoctorCalendar;
