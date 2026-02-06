const Appointment = require("../models/Appointment");
const { dateFormatter } = require("../utils/helpers/date.formatter");

class SlotAvailabilityService {
  constructor() {
    this.workingHours = {
      start: 10, // 10 AM
      end: 21, // 9 PM
      interval: 30, // 30 minutes
    };
  }

  // Generate all time slots for a day
  generateAllSlots() {
    const slots = [];
    const { start, end, interval } = this.workingHours;

    for (let hour = start; hour < end; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const time = new Date();
        time.setHours(hour, minute, 0, 0);
        const formattedTime = dateFormatter.formatTime(time);
        slots.push(formattedTime);
      }
    }

    return slots;
  }

  // Check if a specific slot is available
  async isSlotAvailable(date, time) {
    try {
      const existingAppointment = await Appointment.findOne({
        date,
        time,
        status: { $nin: ["cancelled", "blocked"] },
      });

      return !existingAppointment;
    } catch (error) {
      console.error("Is Slot Available Error:", error);
      throw error;
    }
  }

  // Get available slots for a specific date
  async getAvailableSlots(date) {
    try {
      // Get all booked appointments for the date
      const bookedAppointments = await Appointment.find({
        date,
        status: { $nin: ["cancelled"] },
        time: { $exists: true, $ne: "" },
      }).select("time status isBlockedSlot");

      // Separate booked and blocked times
      const bookedTimes = bookedAppointments
        .filter((apt) => apt.status !== "blocked" && !apt.isBlockedSlot)
        .map((apt) => apt.time);

      const blockedTimes = bookedAppointments
        .filter((apt) => apt.status === "blocked" || apt.isBlockedSlot)
        .map((apt) => apt.time);

      // Generate all possible slots
      const allSlots = this.generateAllSlots();

      // Check availability for each slot
      const slotAvailability = allSlots.map((slotTime) => {
        const isBooked = bookedTimes.includes(slotTime);
        const isBlocked = blockedTimes.includes(slotTime);

        return {
          time: slotTime,
          isBooked,
          isBlocked,
          isAvailable: !isBooked && !isBlocked,
          status: isBlocked ? "blocked" : isBooked ? "booked" : "available",
        };
      });

      return {
        date,
        slots: slotAvailability,
        totalSlots: slotAvailability.length,
        availableSlots: slotAvailability.filter((s) => s.isAvailable).length,
        bookedSlots: slotAvailability.filter((s) => s.isBooked).length,
        blockedSlots: slotAvailability.filter((s) => s.isBlocked).length,
      };
    } catch (error) {
      console.error("Get Available Slots Error:", error);
      throw error;
    }
  }

  // Get booked slots for a date range
  async getBookedSlots(startDate, endDate = null) {
    try {
      const query = {
        status: { $nin: ["cancelled"] },
        time: { $exists: true, $ne: "" },
      };

      if (startDate) {
        query.date = startDate;
        if (endDate) {
          // For date range, we need a different approach since dates are stored as Arabic strings
          // This is a simplified version - in production, you'd need to convert dates properly
          query.date = { $gte: startDate, $lte: endDate };
        }
      }

      const appointments = await Appointment.find(query)
        .select("date time serviceId status isBlockedSlot")
        .populate("serviceId", "title_ar category")
        .lean();

      // Organize slots by date
      const bookedSlots = {};
      const blockedSlots = {};

      appointments.forEach((appointment) => {
        const isBlocked =
          appointment.status === "blocked" || appointment.isBlockedSlot;

        if (!bookedSlots[appointment.date]) {
          bookedSlots[appointment.date] = [];
        }
        if (!blockedSlots[appointment.date]) {
          blockedSlots[appointment.date] = [];
        }

        bookedSlots[appointment.date].push({
          time: appointment.time,
          isBooked: !isBlocked,
          isBlocked,
          service: appointment.serviceId,
          status: appointment.status,
        });

        if (isBlocked) {
          blockedSlots[appointment.date].push(appointment.time);
        }
      });

      return {
        bookedSlots,
        blockedSlots,
        total: appointments.length,
      };
    } catch (error) {
      console.error("Get Booked Slots Error:", error);
      throw error;
    }
  }

  // Check multiple slots at once
  async checkMultipleSlots(date, times) {
    try {
      const results = [];

      for (const time of times) {
        const isAvailable = await this.isSlotAvailable(date, time);
        results.push({
          time,
          isAvailable,
        });
      }

      return results;
    } catch (error) {
      console.error("Check Multiple Slots Error:", error);
      throw error;
    }
  }

  // Get next available slot
  async getNextAvailableSlot(date, startFromTime = null) {
    try {
      const availableSlots = await this.getAvailableSlots(date);
      const availableTimes = availableSlots.slots
        .filter((slot) => slot.isAvailable)
        .map((slot) => slot.time);

      if (availableTimes.length === 0) {
        return null;
      }

      if (!startFromTime) {
        return availableTimes[0];
      }

      // Find first available slot after the specified time
      const startIndex = availableTimes.indexOf(startFromTime);
      if (startIndex !== -1 && startIndex < availableTimes.length - 1) {
        return availableTimes[startIndex + 1];
      }

      // If startFromTime is not found or is the last one, return the first available
      return availableTimes[0];
    } catch (error) {
      console.error("Get Next Available Slot Error:", error);
      throw error;
    }
  }

  // Get availability for multiple dates
  async getAvailabilityForDates(dates) {
    try {
      const availability = {};

      for (const date of dates) {
        const slots = await this.getAvailableSlots(date);
        availability[date] = slots;
      }

      return availability;
    } catch (error) {
      console.error("Get Availability For Dates Error:", error);
      throw error;
    }
  }

  // Validate time format
  isValidTimeFormat(time) {
    // Accept both Arabic and English time formats
    const timeRegex =
      /^(0?[0-9]|1[0-9]|2[0-3]):[0-5][0-9]\s?(ص|م|am|pm|AM|PM)?$/;
    const arabicTimeRegex = /^[٠-٩]{1,2}:[٠-٩]{2}\s?(ص|م)$/;

    return timeRegex.test(time) || arabicTimeRegex.test(time);
  }

  // Normalize time format to Arabic
  normalizeTimeToArabic(time) {
    if (!this.isValidTimeFormat(time)) {
      throw new Error("Invalid time format");
    }

    // If already in Arabic format, return as-is
    if (time.includes("ص") || time.includes("م")) {
      return time;
    }

    // Convert English to Arabic
    const [hours, minutesPeriod] = time.split(":");
    let [minutes, period] = minutesPeriod.split(" ");

    // Convert Arabic numerals to English if needed
    const arabicToEnglish = {
      "٠": "0",
      "١": "1",
      "٢": "2",
      "٣": "3",
      "٤": "4",
      "٥": "5",
      "٦": "6",
      "٧": "7",
      "٨": "8",
      "٩": "9",
    };

    let normalizedHours = hours;
    let normalizedMinutes = minutes;

    // Check if hours are in Arabic numerals
    if (/[٠-٩]/.test(hours)) {
      normalizedHours = hours
        .split("")
        .map((char) => arabicToEnglish[char] || char)
        .join("");
    }

    if (/[٠-٩]/.test(minutes)) {
      normalizedMinutes = minutes
        .split("")
        .map((char) => arabicToEnglish[char] || char)
        .join("");
    }

    // Convert to 24-hour format for processing
    let hourInt = parseInt(normalizedHours, 10);
    const minuteInt = parseInt(normalizedMinutes, 10);

    if (period) {
      period = period.toLowerCase();
      if (period === "م" || period === "pm") {
        if (hourInt < 12) hourInt += 12;
      } else if (period === "ص" || period === "am") {
        if (hourInt === 12) hourInt = 0;
      }
    }

    // Format back to Arabic time string
    const timeObj = new Date();
    timeObj.setHours(hourInt, minuteInt, 0, 0);

    return dateFormatter.formatTime(timeObj);
  }
}

module.exports = new SlotAvailabilityService();
