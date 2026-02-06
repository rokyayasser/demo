/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";

const TimeSlots = ({
  selectedDate,
  selectedTime,
  bookedSlots = {},
  blockedSlots = {},
  onTimeSelect,
}) => {
  // Generate time slots (10 AM to 9 PM, 30-minute intervals)
  // In TimeSlots.jsx, update the time generation
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 10; hour < 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = new Date();
        time.setHours(hour, minute, 0, 0);

        // Convert to Arabic time format
        const arabicTime = time
          .toLocaleTimeString("ar-EG", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
          .replace("AM", "ص")
          .replace("PM", "م");

        // Also keep the numeric format for API calls
        const numericTime = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;

        const isBooked =
          bookedSlots[selectedDate]?.includes(arabicTime) || false;
        const isBlocked =
          blockedSlots[selectedDate]?.includes(arabicTime) || false;
        const isUnavailable = isBooked || isBlocked;

        slots.push({
          time: arabicTime, // Store Arabic format
          numericTime: numericTime, // Store numeric format for API
          formattedTime: arabicTime, // Display Arabic format
          isBooked,
          isBlocked,
          isUnavailable,
        });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-borderLight">
      <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        أوقات الحجز المتاحة ليوم {selectedDate}
      </h3>

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {timeSlots.map((slot, index) => (
          <motion.div
            key={slot.time}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.02 }}
            className="relative"
          >
            <motion.button
              whileHover={!slot.isUnavailable ? { scale: 1.05 } : {}}
              whileTap={!slot.isUnavailable ? { scale: 0.95 } : {}}
              onClick={() => !slot.isUnavailable && onTimeSelect(slot.time)}
              disabled={slot.isUnavailable}
              className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                slot.isBlocked
                  ? "bg-red-50 border border-red-200 text-red-600 cursor-not-allowed"
                  : slot.isBooked
                  ? "bg-gray-100 border border-gray-300 text-gray-500 cursor-not-allowed"
                  : selectedTime === slot.time
                  ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg"
                  : "bg-lightBg text-textMain hover:bg-accent hover:shadow-md"
              }`}
            >
              {/* Slot content */}
              <div className="relative z-10">
                <span className={slot.isUnavailable ? "blur-text" : ""}>
                  {slot.formattedTime}
                </span>
              </div>

              {/* Red X mark for booked/blocked slots */}
              {slot.isUnavailable && (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-6 h-6">
                      {/* Diagonal red X */}
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 transform -rotate-45"></div>
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 transform rotate-45"></div>
                    </div>
                  </div>

                  {/* Status text */}
                  <div className="absolute top-1 left-1 z-20">
                    <span
                      className={`text-[10px] font-bold ${
                        slot.isBlocked ? "text-red-600" : "text-red-500"
                      }`}
                    >
                      {slot.isBlocked ? "محظور" : "محجوز"}
                    </span>
                  </div>
                </>
              )}
            </motion.button>
          </motion.div>
        ))}
      </div>

      {selectedTime && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl"
        >
          <p className="text-green-700 font-medium flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            تم اختيار الموعد: {selectedDate} الساعة {selectedTime}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default TimeSlots;
