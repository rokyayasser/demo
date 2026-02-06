const jwt = require("jsonwebtoken");
const appointmentModel = require("../models/appointmentModel.js");
const medicalServiceModel = require("../models/medicalServiceModel.js");

// Doctor login
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("=== DOCTOR LOGIN ATTEMPT ===");
    console.log("Email:", email);

    if (!email || !password) {
      return res.json({
        success: false,
        message: "Email and password are required",
      });
    }

    if (
      email === process.env.DOCTOR_EMAIL &&
      password === process.env.DOCTOR_PASSWORD
    ) {
      const token = jwt.sign(
        {
          email,
          isDoctor: true,
          userId: "doctor-" + Date.now(),
          name: "د. الخطيب",
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      console.log("✅ Doctor login successful for:", email);

      res.json({
        success: true,
        message: "تم تسجيل الدخول بنجاح",
        token,
        doctor: {
          name: "د. الخطيب",
          email: email,
          specialty: "الطب العام",
        },
      });
    } else {
      console.log("❌ Invalid doctor credentials for:", email);
      res.json({
        success: false,
        message: "بيانات الدخول غير صحيحة",
      });
    }
  } catch (error) {
    console.error("❌ Error in doctor login:", error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Get all doctor appointments - SIMPLIFIED LIKE ADMIN
// Get all doctor appointments - FIXED DATE FILTER
const getDoctorAppointments = async (req, res) => {
  try {
    console.log("=== FETCHING DOCTOR APPOINTMENTS ===");

    const { status, date, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (date) {
      console.log(`Date filter received: "${date}"`);

      // Check if date is in ISO format (YYYY-MM-DD)
      const isoPattern = /^\d{4}-\d{2}-\d{2}$/;

      if (isoPattern.test(date)) {
        console.log(`Date is in ISO format: ${date}`);

        // Convert ISO date to multiple Arabic formats for better matching
        const [year, month, day] = date.split("-");
        const jsDate = new Date(year, month - 1, day);

        // Create multiple possible Arabic date formats
        const arabicFormats = [
          jsDate.toLocaleDateString("ar-EG", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          jsDate.toLocaleDateString("ar-EG", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          // Try without weekday
          jsDate
            .toLocaleDateString("ar-EG", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
            .replace(/^[\u0600-\u06FF]+\s?،?\s?/, ""),
        ];

        console.log(`Trying Arabic formats:`, arabicFormats);

        // Use $in operator to match any of the formats
        query.date = { $in: arabicFormats };
      } else {
        // Date is already in Arabic format
        console.log(`Date is in Arabic format: "${date}"`);
        query.date = date;
      }

      console.log(`Final query for date:`, query.date);
    }

    const totalCount = await appointmentModel.countDocuments(query);
    console.log(`Found ${totalCount} appointments matching query`);

    const appointments = await appointmentModel
      .find(query)
      .populate("serviceId", "title title_ar category fees")
      .populate("userId", "name email phone")
      .sort({ date: 1, time: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log(`✅ Retrieved ${appointments.length} appointments for doctor`);

    const transformedAppointments = appointments.map((appt) => ({
      _id: appt._id,
      name: appt.userId?.name || appt.name,
      email: appt.userId?.email || appt.email,
      phone: appt.userId?.phone || appt.phone,
      date: appt.date,
      time: appt.time,
      status: appt.status,
      paid: appt.paid,
      amount: appt.amount,
      message: appt.message,
      service: appt.serviceId
        ? {
            _id: appt.serviceId._id,
            title: appt.serviceId.title,
            title_ar: appt.serviceId.title_ar,
            category: appt.serviceId.category,
            fees: appt.serviceId.fees,
          }
        : null,
      createdAt: appt.createdAt,
      updatedAt: appt.updatedAt,
      doctorNotes: appt.doctorNotes || "",
      // NEW: Include medical information
      medicalInfo: appt.medicalInfo || {},
      // NEW: Include form answers
      answers: appt.answers || {},
      // NEW: Include user info from form
      userInfo: appt.userInfo || {},
    }));

    res.json({
      success: true,
      appointments: transformedAppointments,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
      stats: {
        pending: await appointmentModel.countDocuments({
          ...query,
          status: "pending",
        }),
        confirmed: await appointmentModel.countDocuments({
          ...query,
          status: "confirmed",
        }),
        completed: await appointmentModel.countDocuments({
          ...query,
          status: "completed",
        }),
        cancelled: await appointmentModel.countDocuments({
          ...query,
          status: "cancelled",
        }),
      },
      queryInfo: {
        dateFilter: date,
        queryUsed: query,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching doctor appointments:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single appointment with full details
const getAppointmentDetails = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("=== FETCHING APPOINTMENT DETAILS ===");
    console.log("Appointment ID:", id);

    const appointment = await appointmentModel
      .findById(id)
      .populate("serviceId", "title title_ar category fees")
      .populate("userId", "name email phone");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Combine medical info from different possible sources
    const medicalInfo = {
      ...appointment.medicalInfo,
      ...(appointment.answers || {}),
    };

    // Extract file URLs
    const files = {
      medicationsFile: appointment.medicalInfo?.medicationsFile || null,
      testsFile: appointment.medicalInfo?.testsFile || null,
      otherDocuments: appointment.medicalInfo?.otherDocuments || null,
    };

    console.log("📁 Files extracted:", {
      hasMedicationsFile: !!files.medicationsFile,
      hasTestsFile: !!files.testsFile,
      hasOtherDocuments: !!files.otherDocuments,
    });

    // Construct detailed response
    const detailedAppointment = {
      _id: appointment._id,
      name: appointment.userId?.name || appointment.name,
      email: appointment.userId?.email || appointment.email,
      phone: appointment.userId?.phone || appointment.phone,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
      paid: appointment.paid,
      amount: appointment.amount,
      message: appointment.message,
      service: appointment.serviceId
        ? {
            _id: appointment.serviceId._id,
            title: appointment.serviceId.title,
            title_ar: appointment.serviceId.title_ar,
            category: appointment.serviceId.category,
            fees: appointment.serviceId.fees,
          }
        : null,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
      doctorNotes: appointment.doctorNotes || "",
      // Medical Information - combined from all sources
      medicalInfo: medicalInfo,
      // Form answers
      answers: appointment.answers || {},
      // User info from form
      userInfo: appointment.userInfo || {},
      // File paths - directly from medicalInfo
      files: files,
    };

    res.json({
      success: true,
      appointment: detailedAppointment,
    });
  } catch (error) {
    console.error("❌ Error fetching appointment details:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Get appointments by specific date - IMPROVED VERSION
const getAppointmentsByDate = async (req, res) => {
  try {
    let { date } = req.params;

    console.log(`=== FETCHING APPOINTMENTS FOR DATE ===`);
    console.log(`Original param: "${date}"`);

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    let appointments = [];
    let searchDate = date;

    // Try to detect and convert ISO dates
    const isoPattern = /^\d{4}-\d{2}-\d{2}$/;
    if (isoPattern.test(date)) {
      console.log(`Detected ISO format: ${date}`);
      const [year, month, day] = date.split("-");
      const jsDate = new Date(year, month - 1, day);

      // Try multiple Arabic date formats
      const arabicFormats = [
        jsDate.toLocaleDateString("ar-EG", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        jsDate.toLocaleDateString("ar-EG", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      ];

      console.log(`Trying Arabic formats:`, arabicFormats);

      // Try each format
      for (const arabicFormat of arabicFormats) {
        appointments = await appointmentModel
          .find({
            date: arabicFormat,
            status: { $nin: ["cancelled"] },
          })
          .populate("serviceId", "title title_ar")
          .populate("userId", "name email phone")
          .sort({ time: 1 });

        if (appointments.length > 0) {
          searchDate = arabicFormat;
          break;
        }
      }

      if (appointments.length === 0) {
        // No appointments found for this date
        return res.json({
          success: true,
          date: searchDate,
          appointments: [],
          total: 0,
          byStatus: {
            pending: 0,
            confirmed: 0,
            completed: 0,
          },
          message: "No appointments found for this date",
        });
      }
    } else {
      // Use date as-is (assuming it's already in Arabic format)
      appointments = await appointmentModel
        .find({
          date: date,
          status: { $nin: ["cancelled"] },
        })
        .populate("serviceId", "title title_ar")
        .populate("userId", "name email phone")
        .sort({ time: 1 });
    }

    console.log(
      `✅ Found ${appointments.length} appointments for "${searchDate}"`
    );

    // Transform appointments
    const transformedAppointments = appointments.map((appt) => ({
      _id: appt._id,
      name: appt.userId?.name || appt.name,
      email: appt.userId?.email || appt.email,
      phone: appt.userId?.phone || appt.phone,
      date: appt.date,
      time: appt.time || "غير محدد",
      status: appt.status,
      paid: appt.paid,
      amount: appt.amount || 0,
      message: appt.message || "",
      service: appt.serviceId
        ? {
            _id: appt.serviceId._id,
            title: appt.serviceId.title,
            title_ar: appt.serviceId.title_ar,
          }
        : null,
      doctorNotes: appt.doctorNotes || "",
    }));

    res.json({
      success: true,
      date: searchDate,
      appointments: transformedAppointments,
      total: transformedAppointments.length,
      byStatus: {
        pending: transformedAppointments.filter((a) => a.status === "pending")
          .length,
        confirmed: transformedAppointments.filter(
          (a) => a.status === "confirmed"
        ).length,
        completed: transformedAppointments.filter(
          (a) => a.status === "completed"
        ).length,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching appointments by date:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get today's appointments - FIXED VERSION
const getTodayAppointments = async (req, res) => {
  try {
    const today = new Date();
    // Format as Arabic date string (like what's stored in database)
    const todayString = today.toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    console.log(`=== FETCHING TODAY'S APPOINTMENTS: ${todayString} ===`);

    const appointments = await appointmentModel
      .find({
        date: todayString, // Match Arabic date format
        status: { $nin: ["cancelled"] },
      })
      .populate("serviceId", "title title_ar category fees")
      .populate("userId", "name email phone")
      .sort({ time: 1 });

    console.log(`✅ Found ${appointments.length} appointments for today`);

    // Transform appointments to ensure service is properly displayed
    const transformedAppointments = appointments.map((appt) => ({
      _id: appt._id,
      name: appt.userId?.name || appt.name,
      email: appt.userId?.email || appt.email,
      phone: appt.userId?.phone || appt.phone,
      date: appt.date,
      time: appt.time || "غير محدد",
      status: appt.status,
      paid: appt.paid,
      amount: appt.amount || appt.serviceId?.fees || 0,
      message: appt.message,
      service: appt.serviceId
        ? {
            _id: appt.serviceId._id,
            title: appt.serviceId.title,
            title_ar: appt.serviceId.title_ar,
            category: appt.serviceId.category,
            fees: appt.serviceId.fees,
          }
        : { title_ar: "خدمة غير محددة", title: "خدمة غير محددة" },
      createdAt: appt.createdAt,
      updatedAt: appt.updatedAt,
      doctorNotes: appt.doctorNotes || "",
    }));

    // Get tomorrow's appointments count
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const tomorrowAppointments = await appointmentModel
      .find({
        date: tomorrowString,
        status: { $nin: ["cancelled"] },
      })
      .countDocuments();

    res.json({
      success: true,
      date: todayString,
      appointments: transformedAppointments,
      total: transformedAppointments.length,
      upcomingTomorrow: tomorrowAppointments,
      stats: {
        pending: transformedAppointments.filter((a) => a.status === "pending")
          .length,
        confirmed: transformedAppointments.filter(
          (a) => a.status === "confirmed"
        ).length,
        completed: transformedAppointments.filter(
          (a) => a.status === "completed"
        ).length,
        paid: transformedAppointments.filter((a) => a.paid).length,
        unpaid: transformedAppointments.filter((a) => !a.paid).length,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching today's appointments:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get calendar view - SIMPLIFIED
const getCalendarView = async (req, res) => {
  try {
    const { month, year } = req.query;

    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    console.log(
      `=== FETCHING CALENDAR VIEW FOR ${targetMonth + 1}/${targetYear} ===`
    );

    // Generate all days in the month
    const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    const calendarDays = [];

    // Get ALL appointments for the month (no date filtering, we'll filter manually)
    const allAppointments = await appointmentModel
      .find({
        status: { $nin: ["cancelled"] },
      })
      .select("date time status serviceId")
      .populate("serviceId", "title_ar category")
      .lean();

    console.log(`Total appointments in DB: ${allAppointments.length}`);

    // Group appointments by date (as stored in DB)
    const appointmentsByDate = {};
    allAppointments.forEach((appt) => {
      if (!appointmentsByDate[appt.date]) {
        appointmentsByDate[appt.date] = [];
      }
      appointmentsByDate[appt.date].push({
        time: appt.time,
        status: appt.status,
        service: appt.serviceId?.title_ar || "خدمة",
        category: appt.serviceId?.category || "عام",
      });
    });

    // Generate calendar days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(targetYear, targetMonth, day);
      // Create Arabic date string to match DB format
      const arabicDate = date.toLocaleDateString("ar-EG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const dayAppointments = appointmentsByDate[arabicDate] || [];

      calendarDays.push({
        date: arabicDate, // Arabic date string
        day: day,
        dayOfWeek: date.getDay(),
        appointments: dayAppointments,
        totalAppointments: dayAppointments.length,
        statusCounts: {
          pending: dayAppointments.filter((a) => a.status === "pending").length,
          confirmed: dayAppointments.filter((a) => a.status === "confirmed")
            .length,
          completed: dayAppointments.filter((a) => a.status === "completed")
            .length,
        },
        isToday: date.toDateString() === new Date().toDateString(),
        isPast: date < new Date().setHours(0, 0, 0, 0),
      });
    }

    // Calculate monthly stats
    const monthlyStats = {
      total: allAppointments.length,
      pending: allAppointments.filter((a) => a.status === "pending").length,
      confirmed: allAppointments.filter((a) => a.status === "confirmed").length,
      completed: allAppointments.filter((a) => a.status === "completed").length,
      daysWithAppointments: Object.keys(appointmentsByDate).length,
    };

    res.json({
      success: true,
      month: targetMonth + 1,
      year: targetYear,
      calendarDays,
      monthlyStats,
      appointmentsByDate,
    });
  } catch (error) {
    console.error("❌ Error fetching calendar view:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update appointment status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, doctorNotes } = req.body;
    const doctorEmail = req.doctorEmail;

    console.log("=== DOCTOR UPDATING APPOINTMENT ===");
    console.log("Doctor:", doctorEmail);
    console.log("Appointment ID:", id);
    console.log("New status:", status);

    if (
      !status ||
      !["pending", "confirmed", "completed", "cancelled"].includes(status)
    ) {
      return res.json({
        success: false,
        message: "Status is required and must be valid",
      });
    }

    const appointment = await appointmentModel.findById(id);
    if (!appointment) {
      return res.json({
        success: false,
        message: "Appointment not found",
      });
    }

    appointment.status = status;
    appointment.updatedBy = `doctor:${doctorEmail}`;

    if (doctorNotes) {
      appointment.doctorNotes = doctorNotes;
      appointment.doctorNotesAt = new Date();
    }

    await appointment.save();

    console.log(`✅ Appointment ${id} updated to ${status} by doctor`);

    res.json({
      success: true,
      message: `تم تحديث حالة الموعد إلى ${getStatusTextAr(status)}`,
      appointment,
    });
  } catch (error) {
    console.error("❌ Error updating appointment:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get doctor statistics - FIXED REVENUE CALCULATION
const getDoctorStats = async (req, res) => {
  try {
    console.log("=== FETCHING DOCTOR STATS ===");

    // Get ALL appointments with populated service
    const allAppointments = await appointmentModel
      .find({})
      .populate("serviceId", "title title_ar fees")
      .lean();

    console.log(`Total appointments found: ${allAppointments.length}`);

    // Get today's Arabic date
    const today = new Date();
    const todayArabicDate = today.toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    console.log(`Today's Arabic date: ${todayArabicDate}`);

    // Simple counts
    const totalAppointments = allAppointments.length;
    const todayAppointments = allAppointments.filter(
      (appt) => appt.date === todayArabicDate
    ).length;

    console.log(`Today appointments: ${todayAppointments}`);

    // Count by status
    const pendingAppointments = allAppointments.filter(
      (appt) => appt.status === "pending"
    ).length;
    const confirmedAppointments = allAppointments.filter(
      (appt) => appt.status === "confirmed"
    ).length;
    const completedAppointments = allAppointments.filter(
      (appt) => appt.status === "completed"
    ).length;

    console.log(
      `Status counts - Pending: ${pendingAppointments}, Confirmed: ${confirmedAppointments}, Completed: ${completedAppointments}`
    );

    // Calculate revenue - IMPROVED VERSION
    let totalRevenue = 0;
    allAppointments.forEach((appt) => {
      if (appt.paid) {
        // Check amount field first
        if (appt.amount && appt.amount > 0) {
          totalRevenue += appt.amount;
        }
        // Then check service fees
        else if (
          appt.serviceId &&
          appt.serviceId.fees &&
          appt.serviceId.fees > 0
        ) {
          totalRevenue += appt.serviceId.fees;
        }
        // If both are missing, check if amount is 0 but paid
        else if (appt.amount === 0 && appt.paid) {
          // This might be a free appointment, don't add to revenue
        }
      }
    });

    console.log(`Total revenue calculated: ${totalRevenue}`);
    console.log(
      `Paid appointments: ${allAppointments.filter((appt) => appt.paid).length}`
    );

    // Get dates for week and month calculations
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date(now);
    monthAgo.setDate(monthAgo.getDate() - 30);

    console.log(`Week ago: ${weekAgo.toISOString()}`);
    console.log(`Month ago: ${monthAgo.toISOString()}`);

    // Function to convert Arabic date to Date object - IMPROVED
    const parseArabicDate = (arabicDate) => {
      if (!arabicDate) return null;

      try {
        console.log(`Parsing Arabic date: "${arabicDate}"`);

        // Eastern Arabic numerals to Western
        const easternToWestern = {
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

        // Convert Eastern Arabic numerals to Western
        let convertedDate = arabicDate;
        Object.keys(easternToWestern).forEach((easternNum) => {
          const regex = new RegExp(easternNum, "g");
          convertedDate = convertedDate.replace(
            regex,
            easternToWestern[easternNum]
          );
        });

        console.log(`After numeral conversion: "${convertedDate}"`);

        // Extract day, month name, and year
        // Pattern: "الثلاثاء، 6 يناير 2026"
        const pattern = /(\d{1,2})\s+(\S+)\s+(\d{4})/;
        const match = convertedDate.match(pattern);

        if (match) {
          const day = parseInt(match[1]);
          const monthName = match[2].trim();
          const year = parseInt(match[3]);

          const monthMap = {
            يناير: 0,
            فبراير: 1,
            مارس: 2,
            أبريل: 3,
            مايو: 4,
            يونيو: 5,
            يوليو: 6,
            أغسطس: 7,
            سبتمبر: 8,
            أكتوبر: 9,
            نوفمبر: 10,
            ديسمبر: 11,
          };

          if (monthMap[monthName] !== undefined) {
            const dateObj = new Date(year, monthMap[monthName], day);
            console.log(`Parsed date: ${dateObj.toISOString()}`);
            return dateObj;
          } else {
            console.error(`Unknown month name: ${monthName}`);
          }
        } else {
          console.error(`Could not match pattern in: "${convertedDate}"`);

          // Try alternative: Use JavaScript's Date parsing
          try {
            // Remove weekday and comma
            const dateWithoutWeekday = convertedDate.replace(
              /^[\u0600-\u06FF\s،]+/,
              ""
            );
            const parsedDate = new Date(dateWithoutWeekday);
            if (!isNaN(parsedDate.getTime())) {
              console.log(
                `Parsed via Date object: ${parsedDate.toISOString()}`
              );
              return parsedDate;
            }
          } catch (parseError) {
            console.error("Date parsing error:", parseError);
          }
        }
      } catch (error) {
        console.error("Error in parseArabicDate:", error);
      }

      return null;
    };

    // Count appointments for week and month
    let weekAppointments = 0;
    let monthAppointments = 0;

    console.log("\n=== Counting appointments by date ===");

    allAppointments.forEach((appt, index) => {
      const apptDate = parseArabicDate(appt.date);

      if (apptDate) {
        if (apptDate >= monthAgo) {
          monthAppointments++;
          if (apptDate >= weekAgo) {
            weekAppointments++;
          }
        }

        // Debug logging for first few appointments
        if (index < 5) {
          console.log(`Appointment ${index + 1}:`);
          console.log(`  Arabic date: ${appt.date}`);
          console.log(`  Parsed date: ${apptDate.toISOString()}`);
          console.log(`  Week ago: ${weekAgo.toISOString()}`);
          console.log(`  Month ago: ${monthAgo.toISOString()}`);
          console.log(`  Is within week: ${apptDate >= weekAgo}`);
          console.log(`  Is within month: ${apptDate >= monthAgo}`);
        }
      } else {
        console.log(`Could not parse date for appointment: ${appt.date}`);
      }
    });

    console.log(`\n=== Final Counts ===`);
    console.log(`Week appointments: ${weekAppointments}`);
    console.log(`Month appointments: ${monthAppointments}`);

    // Calculate completion rate
    const completionRate =
      totalAppointments > 0
        ? ((completedAppointments / totalAppointments) * 100).toFixed(1)
        : "0.0";

    // Calculate average daily
    const averageDaily =
      totalAppointments > 0 ? (totalAppointments / 30).toFixed(1) : "0.0";

    const statsData = {
      totalAppointments,
      todayAppointments,
      weekAppointments,
      monthAppointments,
      completedAppointments,
      pendingAppointments,
      confirmedAppointments,
      totalRevenue,
      averageDaily,
      completionRate,
    };

    console.log("\n=== Final Stats ===");
    console.log(JSON.stringify(statsData, null, 2));

    res.json({
      success: true,
      stats: statsData,
      lastUpdated: new Date().toISOString(),
      debug: {
        totalAppointments,
        paidAppointments: allAppointments.filter((appt) => appt.paid).length,
        appointmentsWithAmount: allAppointments.filter(
          (appt) => appt.amount > 0
        ).length,
        appointmentsWithServiceFees: allAppointments.filter(
          (appt) => appt.serviceId?.fees > 0
        ).length,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching doctor stats:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Helper function for Arabic status text
const getStatusTextAr = (status) => {
  switch (status) {
    case "pending":
      return "قيد الانتظار";
    case "confirmed":
      return "مؤكد";
    case "completed":
      return "مكتمل";
    case "cancelled":
      return "ملغي";
    default:
      return status;
  }
};

module.exports = {
  loginDoctor,
  getDoctorAppointments,
  getAppointmentsByDate,
  getTodayAppointments,
  getAppointmentDetails,
  getCalendarView,
  updateAppointmentStatus,
  getDoctorStats,
};
