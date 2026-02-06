const BaseController = require("../BaseController");
const appointmentService = require("../../services/appointment.service");

class AdminSlotsController extends BaseController {
  constructor() {
    super();
    this.blockTimeSlot = this.blockTimeSlot.bind(this);
    this.blockTimeSlotRange = this.blockTimeSlotRange.bind(this);
    this.unblockTimeSlot = this.unblockTimeSlot.bind(this);
    this.getBlockedSlots = this.getBlockedSlots.bind(this);
  }

  async blockTimeSlot(req, res) {
    try {
      const adminEmail = req.adminEmail;
      const { date, time, reason } = req.body;

      if (!date || !time) {
        return this.badRequest(res, "Date and time are required");
      }

      const blockedSlot = await appointmentService.blockTimeSlot(
        date,
        time,
        reason,
        adminEmail
      );

      return this.success(
        res,
        {
          blockedSlot: {
            date,
            time,
            reason,
            blockedBy: adminEmail,
          },
        },
        "Time slot blocked successfully"
      );
    } catch (error) {
      console.error("Block Time Slot Error:", error);

      if (error.message.includes("already booked")) {
        return this.conflict(res, "Cannot block an already booked slot");
      }
      if (error.message.includes("already blocked")) {
        return this.conflict(res, "This slot is already blocked");
      }

      return this.error(res, error.message);
    }
  }

  async blockTimeSlotRange(req, res) {
    try {
      const adminEmail = req.adminEmail;
      const { startDate, endDate, startTime, endTime, reason } = req.body;

      if (!startDate) {
        return this.badRequest(res, "Start date is required");
      }

      // Parse Arabic time strings
      const parseTimeString = (timeStr) => {
        if (!timeStr) return null;

        // Convert Arabic numerals to English
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

        let convertedTime = "";
        for (let char of timeStr) {
          convertedTime += arabicToEnglish[char] || char;
        }
        timeStr = convertedTime;

        const parts = timeStr.split(" ");
        let timePart = parts[0];
        const period = parts[1];

        const [hoursStr, minutesStr] = timePart.split(":");
        let hours = parseInt(hoursStr, 10);
        const minutes = parseInt(minutesStr || "0", 10);

        // Handle AM/PM (ص/م)
        if (period === "م" || period === "pm" || period === "PM") {
          if (hours < 12) hours += 12;
        } else if (period === "ص" || period === "am" || period === "AM") {
          if (hours === 12) hours = 0;
        }

        return hours * 60 + minutes;
      };

      const start = new Date(startDate);
      const end = endDate ? new Date(endDate) : new Date(startDate);
      if (!endDate) {
        end.setDate(start.getDate());
      }

      const startMinutes = startTime ? parseTimeString(startTime) : null;
      const endMinutes = endTime ? parseTimeString(endTime) : null;

      const blockedSlots = [];
      const errors = [];

      // Loop through each day in the range
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const currentDate = d.toISOString().split("T")[0];

        // Generate all time slots for this day (10 AM to 9 PM)
        for (let hour = 10; hour < 21; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            const slotMinutes = hour * 60 + minute;

            // Check if time is within the selected range
            let shouldBlock = true;
            if (startMinutes !== null && endMinutes !== null) {
              shouldBlock =
                slotMinutes >= startMinutes && slotMinutes <= endMinutes;
            } else if (startMinutes !== null) {
              shouldBlock = slotMinutes >= startMinutes;
            } else if (endMinutes !== null) {
              shouldBlock = slotMinutes <= endMinutes;
            }

            if (shouldBlock) {
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

              try {
                const blockedSlot = await appointmentService.blockTimeSlot(
                  currentDate,
                  formattedTime,
                  reason,
                  adminEmail
                );
                blockedSlots.push({
                  date: currentDate,
                  time: formattedTime,
                  _id: blockedSlot._id,
                });
              } catch (slotError) {
                errors.push({
                  date: currentDate,
                  time: formattedTime,
                  reason: slotError.message,
                });
              }
            }
          }
        }
      }

      if (blockedSlots.length === 0) {
        return this.error(
          res,
          "Failed to block any slots. Check if slots are already booked or blocked.",
          400
        );
      }

      return this.success(
        res,
        {
          blockedCount: blockedSlots.length,
          errorCount: errors.length,
          blockedSlots: blockedSlots.slice(0, 10),
          errors: errors.slice(0, 10),
          summary: {
            startDate: startDate,
            endDate: endDate || startDate,
            startTime: startTime || "All day",
            endTime: endTime || "All day",
          },
        },
        `Successfully blocked ${blockedSlots.length} slots`
      );
    } catch (error) {
      console.error("Block Time Slot Range Error:", error);
      return this.error(res, error.message);
    }
  }

  async unblockTimeSlot(req, res) {
    try {
      const { slotId } = req.params;
      const adminEmail = req.adminEmail;

      if (!slotId) {
        return this.badRequest(res, "Slot ID is required");
      }

      const unblockedSlot = await appointmentService.unblockTimeSlot(slotId);

      return this.success(
        res,
        {
          unblockedSlot,
        },
        "Time slot unblocked successfully"
      );
    } catch (error) {
      console.error("Unblock Time Slot Error:", error);

      if (error.message.includes("Blocked slot not found")) {
        return this.notFound(res, "Blocked slot not found");
      }

      return this.error(res, error.message);
    }
  }

  async getBlockedSlots(req, res) {
    try {
      const { date } = req.query;

      const { blockedSlots, blockedByDate, total } =
        await appointmentService.getBlockedSlots(date);

      return this.success(
        res,
        {
          blockedSlots,
          blockedByDate,
          total,
        },
        "Blocked slots retrieved successfully"
      );
    } catch (error) {
      console.error("Get Blocked Slots Error:", error);
      return this.error(res, error.message);
    }
  }
}

module.exports = new AdminSlotsController();
