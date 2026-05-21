// components/appointments/TimeSlots.jsx
import React from "react";
import { Lock, X, Check } from "lucide-react";

// Generate all 30-min slots 10:00 → 20:30
const generateSlots = () => {
  const slots = [];
  for (let h = 10; h < 21; h++) {
    for (let m = 0; m < 60; m += 30) {
      const d = new Date();
      d.setHours(h, m, 0, 0);
      const label = d
        .toLocaleTimeString("ar-EG", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        .replace("AM", "ص")
        .replace("PM", "م");
      // Store 24h value for comparison
      slots.push({ label, hour: h, minute: m });
    }
  }
  return slots;
};

const ALL_SLOTS = generateSlots();

const TimeSlots = ({
  selectedDate, // "YYYY-MM-DD"
  selectedTime, // currently selected label e.g. "١٠:٠٠ ص"
  bookedSlots = [], // labels of booked times
  blockedSlots = [], // labels of admin-blocked times
  onTimeSelect,
}) => {
  const now = new Date();

  // Is selectedDate today?
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const isToday = selectedDate === todayStr;

  // Current time in minutes since midnight (add 30min buffer)
  const nowMinutes = isToday ? now.getHours() * 60 + now.getMinutes() + 30 : -1;

  const isPastTime = (slot) => {
    if (!isToday) return false;
    return slot.hour * 60 + slot.minute <= nowMinutes;
  };

  if (!selectedDate) return null;

  const allUnavailable = ALL_SLOTS.every(
    (s) =>
      bookedSlots.includes(s.label) ||
      blockedSlots.includes(s.label) ||
      isPastTime(s),
  );

  return (
    <div dir="rtl">
      <h4 className="text-sm font-semibold text-gray-700 mb-4">
        اختر الوقت المناسب
      </h4>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 mb-5 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1e4b8f]" />
          متاح
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
          مضى
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-gray-200 border border-gray-300" />
          محجوز
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-300" />
          مغلق
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#9b61db]" />
          مختار
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {ALL_SLOTS.map((slot) => {
          const isBlocked = blockedSlots.includes(slot.label);
          const isBooked = bookedSlots.includes(slot.label);
          const isPast = isPastTime(slot);
          const isSelected = selectedTime === slot.label;

          // ── Blocked by admin ─────────────────────────────────────────────
          if (isBlocked)
            return (
              <div
                key={slot.label}
                title="هذا الوقت مغلق من الإدارة"
                className="flex flex-col items-center justify-center gap-0.5 h-14
                rounded-xl border-2 border-red-200 bg-red-50 cursor-not-allowed select-none"
              >
                <Lock className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs font-medium text-red-400">
                  {slot.label}
                </span>
                <span className="text-[10px] text-red-300 leading-none">
                  مغلق
                </span>
              </div>
            );

          // ── Booked ───────────────────────────────────────────────────────
          if (isBooked)
            return (
              <div
                key={slot.label}
                title="هذا الوقت محجوز"
                className="flex flex-col items-center justify-center gap-0.5 h-14
                rounded-xl border-2 border-gray-200 bg-gray-100 cursor-not-allowed select-none"
              >
                <X className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs font-medium text-gray-400">
                  {slot.label}
                </span>
                <span className="text-[10px] text-gray-400 leading-none">
                  محجوز
                </span>
              </div>
            );

          // ── Past time (today only) ────────────────────────────────────────
          if (isPast)
            return (
              <div
                key={slot.label}
                title="هذا الوقت مضى"
                className="flex items-center justify-center h-14 rounded-xl
                border-2 border-gray-100 bg-gray-50 cursor-not-allowed select-none"
              >
                <span className="text-xs font-medium text-gray-300">
                  {slot.label}
                </span>
              </div>
            );

          // ── Selected ─────────────────────────────────────────────────────
          if (isSelected)
            return (
              <button
                key={slot.label}
                onClick={() => onTimeSelect(slot.label)}
                className="flex flex-col items-center justify-center gap-0.5 h-14
                rounded-xl border-2 border-[#9b61db] bg-[#9b61db] text-white
                shadow-lg shadow-[#9b61db]/30 transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">{slot.label}</span>
              </button>
            );

          // ── Available ────────────────────────────────────────────────────
          return (
            <button
              key={slot.label}
              onClick={() => onTimeSelect(slot.label)}
              className="flex items-center justify-center h-14 rounded-xl
                border-2 border-[#1e4b8f]/20 bg-white text-[#1e4b8f]
                text-xs font-medium hover:border-[#9b61db] hover:bg-[#9b61db]/5
                hover:text-[#9b61db] hover:shadow-sm active:scale-95 transition-all"
            >
              {slot.label}
            </button>
          );
        })}
      </div>

      {allUnavailable && (
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
          <p className="text-amber-700 text-sm font-medium">
            لا توجد أوقات متاحة في هذا اليوم
          </p>
          <p className="text-amber-500 text-xs mt-1">يرجى اختيار يوم آخر</p>
        </div>
      )}
    </div>
  );
};

export default TimeSlots;
