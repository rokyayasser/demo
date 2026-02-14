const Appointment = require("../models/Appointment");
const MedicalService = require("../models/MedicalService");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");
const { APPOINTMENT_STATUS } = require("../utils/constants/appointment.status");
const mongoose = require("mongoose");

class AppointmentService {
  constructor() {
    // Bind methods to ensure correct 'this' context
    this.normalizeTimeToArabic = this.normalizeTimeToArabic.bind(this);
    this.checkSlotAvailability = this.checkSlotAvailability.bind(this);
    this.createAppointment = this.createAppointment.bind(this);
    this.getAppointmentsByUserId = this.getAppointmentsByUserId.bind(this);
    this.cancelAppointment = this.cancelAppointment.bind(this);
    this.getBookedSlots = this.getBookedSlots.bind(this);
    this.getAvailableSlots = this.getAvailableSlots.bind(this);
    this.updateAppointmentStatus = this.updateAppointmentStatus.bind(this);
    this.blockTimeSlot = this.blockTimeSlot.bind(this);
    this.unblockTimeSlot = this.unblockTimeSlot.bind(this);
    this.getBlockedSlots = this.getBlockedSlots.bind(this);
  }

  // Helper methods as class methods
  convertToArabicNumerals(number) {
    const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return number
      .toString()
      .replace(/\d/g, (digit) => arabicNumerals[digit] || digit);
  }

  convertToEnglishNumerals(arabicNumber) {
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

    return arabicNumber
      .toString()
      .split("")
      .map((char) => arabicToEnglish[char] || char)
      .join("");
  }

  normalizeTimeToArabic(time) {
    try {
      // If time is already in Arabic format, return as-is
      if (!time || time.trim() === "") return "";

      // Check if already contains Arabic period indicators
      if (time.includes("ص") || time.includes("م")) {
        return time;
      }

      // If it's a numeric format with English AM/PM
      const timeStr = time.toString().trim().toUpperCase();

      // Handle 24-hour format (e.g., "14:00", "18:00")
      if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeStr)) {
        const [hours, minutes] = timeStr.split(":");
        const hour = parseInt(hours, 10);
        const minute = parseInt(minutes, 10);

        const isPM = hour >= 12;
        const displayHour = hour % 12 || 12;

        // Convert to Arabic numerals
        const arabicHour = this.convertToArabicNumerals(displayHour.toString());
        const arabicMinute = this.convertToArabicNumerals(
          minute.toString().padStart(2, "0")
        );
        const period = isPM ? "م" : "ص";

        return `${arabicHour}:${arabicMinute} ${period}`;
      }

      // Handle English AM/PM format (e.g., "02:00 PM")
      if (timeStr.includes("AM") || timeStr.includes("PM")) {
        const [timePart, period] = timeStr.split(" ");
        const [hours, minutes] = timePart.split(":");
        const hour = parseInt(hours, 10);
        const minute = minutes ? parseInt(minutes, 10) : 0;

        const displayHour = hour % 12 || 12;
        const arabicHour = this.convertToArabicNumerals(displayHour.toString());
        const arabicMinute = this.convertToArabicNumerals(
          minute.toString().padStart(2, "0")
        );
        const arabicPeriod = period === "PM" ? "م" : "ص";

        return `${arabicHour}:${arabicMinute} ${arabicPeriod}`;
      }

      // If we can't parse it, try to convert Arabic numerals to English first
      const englishTime = this.convertToEnglishNumerals(time);
      if (englishTime !== time) {
        return this.normalizeTimeToArabic(englishTime);
      }

      console.warn("Could not normalize time format:", time);
      return time;
    } catch (error) {
      console.error("Error normalizing time:", error, time);
      return time;
    }
  }

  async debugSlotChecking(date, time) {
    console.log("=== DEBUG SLOT CHECKING ===");
    console.log("Checking date:", date);
    console.log("Checking time:", time);

    const normalizedTime = this.normalizeTimeToArabic(time);
    console.log("Normalized time:", normalizedTime);

    // Find all appointments on this date
    const allAppointments = await Appointment.find({
      date: date,
      time: { $exists: true, $ne: "" },
    })
      .select("time status isBlockedSlot")
      .lean();

    console.log("All appointments on this date:", allAppointments);

    // Check if our specific time exists
    const specificAppointment = await Appointment.findOne({
      date: date,
      time: normalizedTime,
    })
      .select("time status isBlockedSlot")
      .lean();

    console.log("Specific appointment at this time:", specificAppointment);
    console.log("=== END DEBUG ===");

    return { allAppointments, specificAppointment };
  }

  async checkSlotAvailability(date, time) {
    try {
      // Add debug logging
      await this.debugSlotChecking(date, time);

      // Normalize the time format
      const normalizedTime = this.normalizeTimeToArabic(time);
      console.log(
        `Checking slot availability: Date=${date}, Time=${time}, Normalized=${normalizedTime}`
      );

      // Find any appointment at this date and time
      const existingAppointment = await Appointment.findOne({
        date: date,
        time: normalizedTime,
        status: { $nin: ["cancelled"] }, // Include all non-cancelled appointments
      });

      if (existingAppointment) {
        console.log("Found existing appointment:", {
          id: existingAppointment._id,
          date: existingAppointment.date,
          time: existingAppointment.time,
          status: existingAppointment.status,
          isBlockedSlot: existingAppointment.isBlockedSlot,
        });

        // Check if it's blocked
        if (
          existingAppointment.isBlockedSlot ||
          existingAppointment.status === "blocked"
        ) {
          console.log("Slot is blocked by admin");
          return false;
        }

        // Check if it's booked (pending, confirmed, completed, no_show)
        if (existingAppointment.status !== "cancelled") {
          console.log("Slot is already booked");
          return false;
        }
      }

      console.log("Slot is available");
      return true;
    } catch (error) {
      console.error("Check Slot Availability Error:", error);
      throw error;
    }
  }

  async createAppointment(appointmentData, userId) {
    try {
      // Validate service exists and is available
      const service = await MedicalService.findById(appointmentData.serviceId);
      if (!service) {
        throw new Error("Service not found");
      }

      if (!service.available) {
        throw new Error("Service is not available");
      }

      // Normalize time
      const normalizedTime = this.normalizeTimeToArabic(
        appointmentData.time || ""
      );
      console.log("Creating appointment with:", {
        originalDate: appointmentData.date,
        originalTime: appointmentData.time,
        normalizedTime,
        userId,
      });

      // Check slot availability
      const isAvailable = await this.checkSlotAvailability(
        appointmentData.date,
        appointmentData.time || ""
      );

      if (!isAvailable) {
        // Check if it's blocked or booked
        const existing = await Appointment.findOne({
          date: appointmentData.date,
          time: normalizedTime,
          status: { $nin: ["cancelled"] },
        });

        const errorMessage = existing?.isBlockedSlot
          ? "هذا الموعد محجوز بالفعل برجاء اختيار موعد اخر"
          : "Time slot already booked";

        throw new Error(errorMessage);
      }

      // Get user info
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Handle file uploads
      let medicationsFileUrl = null;
      let testsFileUrl = null;

      if (appointmentData.medicationsFile) {
        medicationsFileUrl = await cloudinary.uploadFile(
          appointmentData.medicationsFile.buffer,
          "appointments/medications",
          appointmentData.medicationsFile.originalname
        );
      }

      if (appointmentData.testsFile) {
        testsFileUrl = await cloudinary.uploadFile(
          appointmentData.testsFile.buffer,
          "appointments/tests",
          appointmentData.testsFile.originalname
        );
      }

      // Create appointment
      const appointment = new Appointment({
        userId,
        serviceId: appointmentData.serviceId,
        name: `${appointmentData.firstName} ${appointmentData.lastName}`,
        email: appointmentData.email || user.email,
        phone: appointmentData.phone || user.phone,
        date: appointmentData.date,
        time: normalizedTime,
        category: appointmentData.category,
        message: appointmentData.message || "",
        amount: appointmentData.amount || service.fees,
        status: APPOINTMENT_STATUS.PENDING,
        paid: false,

        medicalInfo: {
          height: appointmentData.height,
          weight: appointmentData.weight,
          age: appointmentData.age,
          chronicDiseases: appointmentData.chronicDiseases,
          currentMedications: appointmentData.currentMedications,
          currentHealthStatus: appointmentData.currentHealthStatus,
          consultationGoal: appointmentData.consultationGoal,
          medicationsFile: medicationsFileUrl,
          testsFile: testsFileUrl,
        },

        userInfo: {
          firstName: appointmentData.firstName,
          lastName: appointmentData.lastName,
          country: appointmentData.country,
          city: appointmentData.city,
        },

        doctorName: "الدكتور الخطيب",
        location: "عيادة الخطيب فارما",
      });

      await appointment.save();

      // Update service statistics
      await MedicalService.findByIdAndUpdate(service._id, {
        $inc: { "meta.bookings": 1 },
      });

      console.log("Appointment created successfully:", appointment._id);
      return appointment;
    } catch (error) {
      console.error("Appointment Service Error:", error);
      throw error;
    }
  }

  async getAppointmentsByUserId(userId, filters = {}) {
    try {
      const { status, page = 1, limit = 10 } = filters;
      const skip = (page - 1) * limit;

      const query = { userId };
      if (status && status !== "all") {
        query.status = status;
      }

      const appointments = await Appointment.find(query)
        .populate("serviceId", "title title_ar category fees")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Appointment.countDocuments(query);

      return {
        appointments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: skip + appointments.length < total,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error("Get Appointments Error:", error);
      throw error;
    }
  }

  async cancelAppointment(appointmentId, userId) {
    try {
      const appointment = await Appointment.findOne({
        _id: appointmentId,
        userId,
        status: { $in: ["pending", "confirmed"] },
      });

      if (!appointment) {
        throw new Error("Appointment not found or cannot be cancelled");
      }

      appointment.status = APPOINTMENT_STATUS.CANCELLED;
      await appointment.save();

      return appointment;
    } catch (error) {
      console.error("Cancel Appointment Error:", error);
      throw error;
    }
  }

  async getBookedSlots(date = null) {
    try {
      const query = {
        status: { $nin: ["cancelled"] },
        time: { $exists: true, $ne: "" },
      };

      if (date) {
        query.date = date;
      }

      console.log("Query for booked slots:", JSON.stringify(query, null, 2));

      const appointments = await Appointment.find(query)
        .select("date time serviceId status isBlockedSlot")
        .populate("serviceId", "title_ar category")
        .lean();

      console.log(`Found ${appointments.length} appointments`);

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

      console.log(
        `Processed ${Object.keys(bookedSlots).length} dates with booked slots`
      );

      return {
        bookedSlots,
        blockedSlots,
        total: appointments.length,
      };
    } catch (error) {
      console.error("Get Booked Slots Service Error:", error);
      throw error;
    }
  }

  async getAvailableSlots(date) {
    try {
      const { bookedSlots } = await this.getBookedSlots(date);
      const bookedTimes = bookedSlots[date] || [];

      const allSlots = [];
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

          const existingSlot = bookedTimes.find(
            (slot) => slot.time === formattedTime
          );
          const isBooked = existingSlot ? existingSlot.isBooked : false;
          const isBlocked = existingSlot ? existingSlot.isBlocked : false;

          allSlots.push({
            time: formattedTime,
            isBooked,
            isBlocked,
            isAvailable: !isBooked && !isBlocked,
            status: isBlocked ? "blocked" : isBooked ? "booked" : "available",
          });
        }
      }

      return {
        date,
        slots: allSlots,
        totalSlots: allSlots.length,
        availableSlots: allSlots.filter((s) => s.isAvailable).length,
        bookedSlots: allSlots.filter((s) => s.isBooked).length,
        blockedSlots: allSlots.filter((s) => s.isBlocked).length,
      };
    } catch (error) {
      console.error("Get Available Slots Error:", error);
      throw error;
    }
  }

  async updateAppointmentStatus(
    appointmentId,
    status,
    adminEmail = null,
    notes = ""
  ) {
    try {
      const validStatuses = [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
        "no_show",
      ];
      if (!validStatuses.includes(status)) {
        throw new Error("Invalid status value");
      }

      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        throw new Error("Appointment not found");
      }

      appointment.status = status;

      if (status === "confirmed" && adminEmail) {
        appointment.adminConfirmed = true;
        appointment.adminEmail = adminEmail;
        appointment.adminConfirmedAt = new Date();
        appointment.updatedBy = `admin:${adminEmail}`;
      }

      if (notes) {
        appointment.notes = notes;
      }

      await appointment.save();

      return appointment;
    } catch (error) {
      console.error("Update Appointment Status Error:", error);
      throw error;
    }
  }

  async blockTimeSlot(date, time, reason, adminEmail) {
    try {
      // Check if slot is already booked
      const existingAppointment = await Appointment.findOne({
        date,
        time,
        status: { $nin: ["cancelled", "blocked"] },
      });

      if (existingAppointment) {
        throw new Error("Cannot block an already booked slot");
      }

      // Check if already blocked
      const alreadyBlocked = await Appointment.findOne({
        date,
        time,
        status: "blocked",
        isBlockedSlot: true,
      });

      if (alreadyBlocked) {
        throw new Error("This slot is already blocked");
      }

      // Create a blocked appointment record
      const blockedAppointment = new Appointment({
        userId: new mongoose.Types.ObjectId(),
        serviceId: new mongoose.Types.ObjectId(),
        name: "إدارة النظام",
        email: "system@khateebpharma.com",
        phone: "0000000000",
        date,
        time,
        category: "ممنوع",
        status: "blocked",
        amount: 1,
        paid: true,
        notes: reason || "تم حظر هذا الموعد من قبل الإدارة",
        adminBlocked: true,
        blockedBy: adminEmail,
        blockedAt: new Date(),
        doctorName: "إدارة النظام",
        location: "عيادة الخطيب فارما",
        isBlockedSlot: true,
      });

      await blockedAppointment.save();
      return blockedAppointment;
    } catch (error) {
      console.error("Block Time Slot Error:", error);
      throw error;
    }
  }

  async unblockTimeSlot(slotId) {
    try {
      const blockedAppointment = await Appointment.findOne({
        _id: slotId,
        isBlockedSlot: true,
        status: "blocked",
      });

      if (!blockedAppointment) {
        throw new Error("Blocked slot not found");
      }

      await Appointment.findByIdAndDelete(slotId);
      return { date: blockedAppointment.date, time: blockedAppointment.time };
    } catch (error) {
      console.error("Unblock Time Slot Error:", error);
      throw error;
    }
  }

  async getBlockedSlots(date = null) {
    try {
      const query = {
        isBlockedSlot: true,
        status: "blocked",
      };

      if (date) {
        query.date = date;
      }

      const blockedSlots = await Appointment.find(query)
        .select("date time notes blockedBy blockedAt")
        .sort({ date: 1, time: 1 })
        .lean();

      // Group by date
      const blockedByDate = {};
      blockedSlots.forEach((slot) => {
        if (!blockedByDate[slot.date]) {
          blockedByDate[slot.date] = [];
        }
        blockedByDate[slot.date].push({
          _id: slot._id,
          time: slot.time,
          notes: slot.notes,
          blockedBy: slot.blockedBy,
          blockedAt: slot.blockedAt,
        });
      });

      return { blockedSlots, blockedByDate, total: blockedSlots.length };
    } catch (error) {
      console.error("Get Blocked Slots Error:", error);
      throw error;
    }
  }
}

module.exports = new AppointmentService();
