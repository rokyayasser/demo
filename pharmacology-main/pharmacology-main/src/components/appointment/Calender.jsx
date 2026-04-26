// components/appointments/Calender.jsx
import React, { useMemo } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";

const DAYS_AR = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];
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

const TOTAL_SLOTS = 22; // 10am–8:30pm, 30-min intervals

const toKey = (year, month, day) =>
  `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const Calendar = ({
  currentMonth,
  currentYear,
  selectedDate,
  bookedSlots = {},
  blockedSlots = {},
  onMonthChange,
  onDateSelect,
}) => {
  const today = new Date();
  const todayKey = toKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const cells = useMemo(() => {
    const arr = Array(firstDayOfWeek).fill(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    return arr;
  }, [firstDayOfWeek, daysInMonth]);

  // ── Navigation ─────────────────────────────────────────────────────────────
  // LEFT arrow (‹) = go to NEXT month (forward in time)
  // RIGHT arrow (›) = go to PREVIOUS month (back in time)
  const goNext = () => {
    if (currentMonth === 11) onMonthChange(0, currentYear + 1);
    else onMonthChange(currentMonth + 1, currentYear);
  };
  const goPrev = () => {
    if (currentMonth === 0) onMonthChange(11, currentYear - 1);
    else onMonthChange(currentMonth - 1, currentYear);
  };

  const getDayStatus = (dateKey) => {
    const taken =
      (bookedSlots[dateKey] || []).length +
      (blockedSlots[dateKey] || []).length;
    if (taken === 0) return "available";
    if (taken >= TOTAL_SLOTS) return "full";
    return "partial";
  };

  return (
    <div dir="rtl">
      {/* ── Month navigation ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        {/* RIGHT side → go to PREVIOUS month */}
        <button
          onClick={goPrev}
          className="p-2 hover:bg-gray-100 rounded-xl transition"
          title="الشهر السابق"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>

        <h3 className="text-base font-bold text-gray-800">
          {MONTHS_AR[currentMonth]} {currentYear}
        </h3>

        {/* LEFT side → go to NEXT month */}
        <button
          onClick={goNext}
          className="p-2 hover:bg-gray-100 rounded-xl transition"
          title="الشهر التالي"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* ── Day headers ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS_AR.map((d) => (
          <div
            key={d}
            className="text-center text-xs text-gray-400 font-medium py-1"
          >
            {d.slice(0, 2)}
          </div>
        ))}
      </div>

      {/* ── Day cells ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;

          const dateKey = toKey(currentYear, currentMonth, day);
          const isPast = dateKey < todayKey;
          const isSelected = selectedDate === dateKey;
          const isToday = dateKey === todayKey;
          const status = getDayStatus(dateKey);
          const isFull = status === "full";
          const isDisabled = isPast || isFull;

          return (
            <button
              key={dateKey}
              disabled={isDisabled}
              onClick={() => !isDisabled && onDateSelect(dateKey)}
              title={
                isPast
                  ? "تاريخ مضى"
                  : isFull
                    ? "لا توجد أوقات متاحة"
                    : undefined
              }
              className={`relative flex flex-col items-center justify-center
                h-11 w-full rounded-xl text-sm font-medium transition-all
                ${
                  isSelected
                    ? "bg-[#1e4b8f] text-white shadow-lg shadow-[#1e4b8f]/30"
                    : isToday
                      ? "ring-2 ring-[#9b61db] text-[#1e4b8f] bg-[#9b61db]/5"
                      : isPast
                        ? "text-gray-300 cursor-not-allowed"
                        : isFull
                          ? "text-gray-400 bg-red-50 cursor-not-allowed"
                          : "text-gray-700 hover:bg-[#1e4b8f]/5 hover:text-[#1e4b8f]"
                }`}
            >
              {day}
              {!isPast && (
                <span
                  className={`absolute bottom-1 w-1.5 h-1.5 rounded-full
                  ${
                    isSelected
                      ? "bg-white"
                      : isFull
                        ? "bg-red-400"
                        : status === "partial"
                          ? "bg-amber-400"
                          : "bg-green-400"
                  }`}
                />
              )}
              {isFull && !isPast && (
                <span
                  className="absolute inset-0 flex items-center justify-center
                  rounded-xl text-red-300 text-lg pointer-events-none"
                >
                  ×
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Legend ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          متاح
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          متاح جزئياً
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          مغلق
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#9b61db]" />
          اليوم
        </span>
      </div>
    </div>
  );
};

export default Calendar;
