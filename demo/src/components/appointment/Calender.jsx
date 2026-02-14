/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import { MONTHS_ARABIC, DAYS_ARABIC } from "../../constants/dates";

const Calendar = ({
  currentMonth,
  currentYear,
  selectedDate,
  bookedSlots = {},
  blockedSlots = {},
  onMonthChange,
  onDateSelect,
}) => {
  // Generate days for current month
  const generateMonthDays = () => {
    const days = [];
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const totalDays = lastDay.getDate();

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateKey = date.toLocaleDateString("ar-EG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const dateKeyISO = date.toISOString().split("T")[0];
      const isPast = date < new Date().setHours(0, 0, 0, 0);

      // Check if date has booked or blocked slots
      const bookedForDate = bookedSlots[dateKey] || [];
      const blockedForDate = blockedSlots[dateKey] || [];

      // Count total unavailable slots
      const totalSlots = 22; // 10 AM to 9 PM, 30 min intervals
      const unavailableSlots = bookedForDate.length + blockedForDate.length;
      const isFullyBooked = unavailableSlots >= totalSlots;

      days.push({
        date,
        dateKey,
        dateKeyISO,
        day,
        isPast,
        isFullyBooked,
        bookedCount: bookedForDate.length,
        blockedCount: blockedForDate.length,
        unavailableSlots,
      });
    }

    return days;
  };

  const monthDays = generateMonthDays();

  const getDayStatus = (day) => {
    if (!day) return "empty";
    if (day.isPast) return "past";
    if (day.isFullyBooked) return "fullyBooked";
    if (selectedDate === day.dateKey) return "selected";
    return "available";
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-borderLight ">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-primary">اختر موعد الحجز</h2>

        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onMonthChange("prev")}
            className="bg-lightBg text-textMain p-3 rounded-xl hover:bg-primary hover:text-white transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </motion.button>

          <span className="text-xl font-bold text-primary min-w-[150px] text-center">
            {MONTHS_ARABIC[currentMonth]} {currentYear}
          </span>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onMonthChange("next")}
            className="bg-lightBg text-textMain p-3 rounded-xl hover:bg-primary hover:text-white transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {DAYS_ARABIC.map((day, index) => (
          <div
            key={index}
            className="text-center font-bold text-primary text-sm py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {monthDays.map((day, index) => {
          const status = getDayStatus(day);

          if (!day) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          return (
            <motion.div
              key={day.dateKeyISO}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={status === "available" ? { scale: 1.05 } : {}}
              whileTap={status === "available" ? { scale: 0.95 } : {}}
              onClick={() =>
                status === "available" && onDateSelect(day.dateKey)
              }
              className={`aspect-square flex flex-col items-center justify-center rounded-xl transition-all duration-300 border-2 relative overflow-hidden ${
                status === "selected"
                  ? "bg-gradient-to-r from-primary to-secondary text-white border-primary"
                  : status === "past"
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : status === "fullyBooked"
                  ? "bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed slot-blurred"
                  : "bg-white text-textMain border-borderLight hover:border-primary cursor-pointer"
              }`}
            >
              {/* Day number */}
              <p
                className={`text-xl font-bold relative z-10 ${
                  status === "fullyBooked" ? "blur-text" : ""
                }`}
              >
                {day.day}
              </p>

              {/* Status indicator */}
              {day.unavailableSlots > 0 && !day.isFullyBooked && (
                <span className="text-[10px] text-orange-600 font-medium mt-1">
                  {day.unavailableSlots}/22 محجوز
                </span>
              )}

              {status === "fullyBooked" && (
                <span className="text-[10px] text-red-600 font-medium mt-1 blur-text">
                  مكتمل
                </span>
              )}

              {/* X icon for fully booked */}
              {status === "fullyBooked" && (
                <div className="absolute top-1 right-1 z-20">
                  <svg
                    className="w-5 h-5 text-red-500 opacity-80"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-borderLight">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-primary to-secondary"></div>
            <span className="text-sm text-textMain">محدد</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-white border border-borderLight"></div>
            <span className="text-sm text-textMain">متاح</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-200 relative slot-blurred">
              <div className="w-4 h-4 rounded bg-gray-300 opacity-50"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-0.5 bg-gray-600 transform rotate-45"></div>
              </div>
            </div>
            <span className="text-sm text-textMain">محجوز/محظور</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300"></div>
            <span className="text-sm text-textMain">منتهي</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
