const appointmentModel = require("../models/appointmentModel.js");

// Get all booked slots (globally across all services)
const getAllBookedSlots = async (req, res) => {
  try {
    console.log("=== FETCHING ALL BOOKED SLOTS ===");

    // Get all appointments that are not cancelled
    const appointments = await appointmentModel
      .find({
        status: { $nin: ["cancelled"] },
        time: { $exists: true, $ne: "" },
      })
      .select("date time serviceId")
      .lean();

    console.log(`Found ${appointments.length} booked appointments`);

    // Group by date and time
    const bookedSlots = {};
    appointments.forEach((apt) => {
      if (!bookedSlots[apt.date]) {
        bookedSlots[apt.date] = [];
      }
      if (apt.time && !bookedSlots[apt.date].includes(apt.time)) {
        bookedSlots[apt.date].push(apt.time);
      }
    });

    console.log(`Booked slots for ${Object.keys(bookedSlots).length} dates`);

    res.json({
      success: true,
      bookedSlots,
      totalDates: Object.keys(bookedSlots).length,
      totalSlots: appointments.length,
    });
  } catch (error) {
    console.error("Error fetching booked slots:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Check if a specific slot is available (globally)
const checkSlotAvailability = async (req, res) => {
  try {
    const { date, time } = req.query;

    if (!date || !time) {
      return res.json({
        success: false,
        message: "Date and time are required",
      });
    }

    // Check if slot exists (globally - not service specific)
    const existingAppointment = await appointmentModel.findOne({
      date: date,
      time: time,
      status: { $nin: ["cancelled"] },
    });

    const isAvailable = !existingAppointment;

    res.json({
      success: true,
      isAvailable,
      date,
      time,
      bookedBy: existingAppointment
        ? {
            serviceId: existingAppointment.serviceId,
            appointmentId: existingAppointment._id,
          }
        : null,
    });
  } catch (error) {
    console.error("Error checking slot availability:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get available slots for a specific date (globally)
const getAvailableSlotsForDate = async (req, res) => {
  try {
    const { date } = req.params;

    if (!date) {
      return res.json({
        success: false,
        message: "Date is required",
      });
    }

    // Get all booked times for this date
    const bookedAppointments = await appointmentModel
      .find({
        date: date,
        status: { $nin: ["cancelled"] },
        time: { $exists: true, $ne: "" },
      })
      .select("time")
      .lean();

    const bookedTimes = bookedAppointments.map((apt) => apt.time);

    // Generate all possible time slots (10 AM to 9 PM)
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

        allSlots.push({
          time: formattedTime,
          isBooked: bookedTimes.includes(formattedTime),
          isAvailable: !bookedTimes.includes(formattedTime),
        });
      }
    }

    res.json({
      success: true,
      date,
      slots: allSlots,
      totalSlots: allSlots.length,
      availableSlots: allSlots.filter((s) => s.isAvailable).length,
      bookedSlots: allSlots.filter((s) => s.isBooked).length,
    });
  } catch (error) {
    console.error("Error getting slots for date:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllBookedSlots,
  checkSlotAvailability,
  getAvailableSlotsForDate,
};
