const Appointment = require("../models/Appointment");
const MedicalService = require("../models/MedicalService");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");
const { APPOINTMENT_STATUS } = require("../utils/constants/appointment.status");

class AppointmentService {
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

      // Normalize date and time
      const normalizedDate = await this.normalizeDate(appointmentData.date);
      const normalizedTime = this.normalizeTimeToArabic(
        appointmentData.time || ""
      );

      console.log("Creating appointment with:", {
        originalDate: appointmentData.date,
        normalizedDate,
        originalTime: appointmentData.time,
        normalizedTime,
        userId,
      });

      // Check slot availability using the same method
      const isAvailable = await this.checkSlotAvailability(
        appointmentData.date,
        appointmentData.time || ""
      );

      if (!isAvailable) {
        // Check if it's blocked or booked
        const existing = await Appointment.findOne({
          $or: [{ date: appointmentData.date }, { date: normalizedDate }],
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
        date: normalizedDate, // Use normalized date
        time: normalizedTime, // Use normalized time
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

  // In appointment.service.js - Update the checkSlotAvailability method:

  async checkSlotAvailability(date, time) {
    try {
      // Normalize the time format
      const normalizedTime = this.normalizeTimeToArabic(time);

      // Try to normalize the date format
      const normalizedDate = await this.normalizeDate(date);

      console.log(
        `Checking slot availability: Date=${date}, NormalizedDate=${normalizedDate}, Time=${normalizedTime}`
      );

      // Check in all possible date formats
      const existingAppointment = await Appointment.findOne({
        $or: [
          { date: date }, // Original date
          { date: normalizedDate }, // Normalized date
          // Also check for dates that might be stored in different formats
        ],
        time: normalizedTime,
        status: { $nin: ["cancelled"] },
      });

      if (existingAppointment) {
        console.log("Found existing appointment:", {
          id: existingAppointment._id,
          date: existingAppointment.date,
          time: existingAppointment.time,
          status: existingAppointment.status,
          isBlockedSlot: existingAppointment.isBlockedSlot,
        });

        if (
          existingAppointment.isBlockedSlot ||
          existingAppointment.status === "blocked"
        ) {
          console.log("Slot is blocked by admin");
          return false;
        }

        if (existingAppointment.status !== "cancelled") {
          console.log("Slot is already booked");
          return false;
        }
      }

      // Also check specifically for blocked slots
      const blockedSlot = await Appointment.findOne({
        $or: [{ date: date }, { date: normalizedDate }],
        time: normalizedTime,
        status: "blocked",
        isBlockedSlot: true,
      });

      if (blockedSlot) {
        console.log("Found blocked slot:", blockedSlot._id);
        return false;
      }

      console.log("Slot is available");
      return true;
    } catch (error) {
      console.error("Check Slot Availability Error:", error);
      throw error;
    }
  }

  // Add this helper method to normalize dates
  async normalizeDate(dateString) {
    try {
      // If it's already in Arabic format, return as-is
      if (dateString.includes("،") && dateString.includes("يناير")) {
        return dateString;
      }

      // If it's in ISO format (YYYY-MM-DD), convert to Arabic
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          return dateString;
        }

        // Format to Arabic date
        const arabicDateHelper = require("./arabic.date");
        return arabicDateHelper.formatToArabicDate(date);
      }

      // If it's a Date object, convert to Arabic
      if (dateString instanceof Date) {
        const arabicDateHelper = require("./arabic.date");
        return arabicDateHelper.formatToArabicDate(dateString);
      }

      return dateString;
    } catch (error) {
      console.error("Error normalizing date:", error);
      return dateString;
    }
  }

  // Add these helper methods:
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
      // IMPORTANT: Throw the error so the controller can catch it
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
