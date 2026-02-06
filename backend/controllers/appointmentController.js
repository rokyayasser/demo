const appointmentModel = require("../models/appointmentModel.js");
const medicalServiceModel = require("../models/medicalServiceModel.js");
const userModel = require("../models/userModel.js");
const cloudinary = require("cloudinary").v2;

const getFileExtension = (filename) => {
  if (!filename) return "";
  const parts = filename.split(".");
  return parts.length > 1 ? "." + parts[parts.length - 1].toLowerCase() : "";
};

const uploadToCloudinary = (fileBuffer, folder, originalFilename) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: `appointments/${folder}`,
      resource_type: "auto", // ✅ الحل السحري
      type: "upload",
      public_id: originalFilename
        ? originalFilename
            .replace(/\.[^/.]+$/, "")
            .replace(/[^a-zA-Z0-9_-]/g, "_")
        : `file_${Date.now()}`,
      overwrite: false,
      unique_filename: true,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    const { Readable } = require("stream");
    const bufferStream = new Readable();
    bufferStream.push(fileBuffer);
    bufferStream.push(null);
    bufferStream.pipe(uploadStream);
  });
};

const bookAppointment = async (req, res) => {
  console.log("=== STARTING APPOINTMENT BOOKING ===");

  try {
    // Debug what we received
    console.log("📦 Request body keys:", Object.keys(req.body || {}));
    console.log("📦 Request file keys:", Object.keys(req.files || {}));

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "لم يتم استلام أي بيانات. يرجى التحقق من النموذج والمحاولة مرة أخرى.",
      });
    }

    // Extract all fields from req.body
    const serviceId = req.body.serviceId;
    const date = req.body.date;
    const category = req.body.category;
    const time = req.body.time || "";
    const message = req.body.message || "";
    const amount = req.body.amount || 0;

    // Extract medical fields
    const firstName = req.body.firstName || "";
    const lastName = req.body.lastName || "";
    const email = req.body.email || "";
    const phone = req.body.phone || "";
    const country = req.body.country || "";
    const city = req.body.city || "";
    const height = req.body.height || "";
    const weight = req.body.weight || "";
    const age = req.body.age || "";
    const chronicDiseases = req.body.chronicDiseases || "";
    const currentMedications = req.body.currentMedications || "";
    const currentHealthStatus = req.body.currentHealthStatus || "";
    const consultationGoal = req.body.consultationGoal || "";

    // Validate required fields
    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: "معرف الخدمة مطلوب",
        arabicMessage: "يرجى اختيار خدمة صالحة",
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "التاريخ مطلوب",
        arabicMessage: "يرجى اختيار تاريخ للموعد",
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "فئة الخدمة مطلوبة",
        arabicMessage: "يرجى تحديد فئة الخدمة",
      });
    }

    // Validate medical fields
    const medicalErrors = [];
    if (!height) medicalErrors.push("الطول مطلوب");
    if (!weight) medicalErrors.push("الوزن مطلوب");
    if (!age) medicalErrors.push("العمر مطلوب");
    if (!chronicDiseases) medicalErrors.push("الأمراض المزمنة مطلوبة");
    if (!currentHealthStatus)
      medicalErrors.push("الحالة الصحية الحالية مطلوبة");
    if (!consultationGoal) medicalErrors.push("الهدف من الاستشارة مطلوب");

    if (medicalErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "بعض الحقول الطبية مفقودة",
        arabicMessage: medicalErrors.join(". "),
        errors: medicalErrors,
      });
    }

    // Check if service exists
    const service = await medicalServiceModel.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
        arabicMessage: "الخدمة غير موجودة",
      });
    }

    // Check service availability
    if (!service.available) {
      return res.json({
        success: false,
        message: "هذه الخدمة غير متاحة للحجز حالياً",
        serviceUnavailable: true,
      });
    }

    // Check slot availability
    const existingAppointment = await appointmentModel.findOne({
      date: date,
      time: time || "",
      status: { $nin: ["cancelled"] },
    });

    if (existingAppointment) {
      const isBlocked =
        existingAppointment.status === "blocked" ||
        existingAppointment.isBlockedSlot;

      return res.json({
        success: false,
        message: isBlocked
          ? "هذا الموعد غير متاح للحجز من قبل الإدارة"
          : "هذا الموعد محجوز بالفعل. يرجى اختيار موعد آخر.",
        slotBooked: !isBlocked,
        slotBlocked: isBlocked,
      });
    }

    // Get user from token
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
        arabicMessage: "يرجى تسجيل الدخول أولاً",
      });
    }

    const user = await userModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "المستخدم غير موجود",
      });
    }

    // Handle file uploads to Cloudinary - FIXED VERSION
    let medicationsFileUrl = null;
    let testsFileUrl = null;

    // Upload medications file
    if (req.files && req.files.medicationsFile) {
      try {
        console.log("📤 Uploading medications file to Cloudinary...");
        medicationsFileUrl = await uploadToCloudinary(
          req.files.medicationsFile.buffer,
          "medications",
          req.files.medicationsFile.originalname || "medications_file"
        );
        console.log("✅ Medications file uploaded:", medicationsFileUrl);
      } catch (uploadError) {
        console.error("❌ Error uploading medications file:", uploadError);
        // Don't fail the entire appointment if file upload fails
      }
    }

    // Upload tests file
    if (req.files && req.files.testsFile) {
      try {
        console.log("📤 Uploading tests file to Cloudinary...");
        testsFileUrl = await uploadToCloudinary(
          req.files.testsFile.buffer,
          "tests",
          req.files.testsFile.originalname || "tests_file"
        );
        console.log("✅ Tests file uploaded:", testsFileUrl);
      } catch (uploadError) {
        console.error("❌ Error uploading tests file:", uploadError);
        // Don't fail the entire appointment if file upload fails
      }
    }

    // Create appointment object
    const appointmentData = {
      userId: req.userId,
      serviceId,
      name: `${firstName || ""} ${lastName || ""}`.trim() || user.name,
      email: email || user.email,
      phone: phone || user.phone,
      date,
      time: time || "",
      category: category.trim(),
      message: message || "",
      amount: amount || service.fees || 0,
      status: "pending",
      paid: false,
      userInfo: {
        firstName: firstName || "",
        lastName: lastName || "",
        email: email || user.email,
        phone: phone || user.phone,
        country: country || "",
        city: city || "",
      },
      medicalInfo: {
        height: height || "",
        weight: weight || "",
        age: age || "",
        chronicDiseases: chronicDiseases || "",
        currentMedications: currentMedications || "",
        currentHealthStatus: currentHealthStatus || "",
        consultationGoal: consultationGoal || "",
        medicationsFile: medicationsFileUrl,
        testsFile: testsFileUrl,
      },
      files: {
        medicationsFile: medicationsFileUrl,
        testsFile: testsFileUrl,
      },
      doctorName: "الدكتور الخطيب",
      location: "عيادة الخطيب فارما",
    };

    console.log("💾 Saving appointment to database...");

    // Save to database
    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    console.log("✅ Appointment saved successfully! ID:", newAppointment._id);

    // Send success response
    res.json({
      success: true,
      message: "تم حجز الموعد بنجاح! سيتم التواصل معك لتأكيد التفاصيل.",
      appointment: {
        _id: newAppointment._id,
        date: newAppointment.date,
        time: newAppointment.time,
        status: newAppointment.status,
      },
    });
  } catch (error) {
    console.error("❌ APPOINTMENT ERROR:", error);
    console.error("Error stack:", error.stack);

    if (error.code === 11000 || error.message.includes("duplicate")) {
      return res.json({
        success: false,
        message: "هذا الموعد محجوز بالفعل. يرجى اختيار موعد آخر.",
        slotBooked: true,
      });
    }

    // Check for validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "خطأ في التحقق من البيانات",
        arabicMessage: errors.join(". "),
        errors: errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حجز الموعد",
      arabicMessage: "عذراً، حدث خطأ تقني. يرجى المحاولة مرة أخرى.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Real-time slot availability check
const checkSlotAvailability = async (req, res) => {
  try {
    const { date, time } = req.query;

    if (!date || !time) {
      return res.json({
        success: false,
        message: "Date and time are required",
      });
    }

    const existingAppointment = await appointmentModel.findOne({
      date: date,
      time: time,
      status: { $nin: ["cancelled", "blocked"] },
    });

    const isAvailable = !existingAppointment;

    res.json({
      success: true,
      isAvailable,
      date,
      time,
      message: isAvailable ? "الموعد متاح" : "الموعد محجوز بالفعل",
      bookedBy: existingAppointment
        ? {
            serviceId: existingAppointment.serviceId,
            appointmentId: existingAppointment._id,
            status: existingAppointment.status,
            isBlocked: existingAppointment.status === "blocked",
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

// Get all booked slots
const getAllBookedSlots = async (req, res) => {
  try {
    console.log("=== FETCHING ALL BOOKED SLOTS ===");

    const appointments = await appointmentModel
      .find({
        status: { $nin: ["cancelled"] },
        time: { $exists: true, $ne: "" },
      })
      .select("date time serviceId status isBlockedSlot")
      .lean();

    console.log(`Found ${appointments.length} booked/blocked appointments`);

    const bookedSlots = {};
    const blockedSlots = {};

    appointments.forEach((apt) => {
      const isBlocked = apt.status === "blocked" || apt.isBlockedSlot;

      if (!bookedSlots[apt.date]) {
        bookedSlots[apt.date] = [];
      }
      if (!blockedSlots[apt.date]) {
        blockedSlots[apt.date] = [];
      }

      if (apt.time) {
        bookedSlots[apt.date].push({
          time: apt.time,
          isBooked: !isBlocked,
          isBlocked: isBlocked,
          serviceId: apt.serviceId,
          status: apt.status,
        });

        if (isBlocked) {
          blockedSlots[apt.date].push(apt.time);
        }
      }
    });

    res.json({
      success: true,
      bookedSlots,
      blockedSlots,
      totalDates: Object.keys(bookedSlots).length,
      totalSlots: appointments.length,
      blockedCount: Object.values(blockedSlots).flat().length,
    });
  } catch (error) {
    console.error("Error fetching booked slots:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get available slots for a specific date
const getAvailableSlotsForDate = async (req, res) => {
  try {
    const { date } = req.params;

    if (!date) {
      return res.json({
        success: false,
        message: "Date is required",
      });
    }

    const bookedAppointments = await appointmentModel
      .find({
        date: date,
        status: { $nin: ["cancelled"] },
        time: { $exists: true, $ne: "" },
      })
      .select("time status isBlockedSlot")
      .lean();

    const bookedTimes = bookedAppointments
      .filter((apt) => apt.status !== "blocked" && !apt.isBlockedSlot)
      .map((apt) => apt.time);

    const blockedTimes = bookedAppointments
      .filter((apt) => apt.status === "blocked" || apt.isBlockedSlot)
      .map((apt) => apt.time);

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

        const isBooked = bookedTimes.includes(formattedTime);
        const isBlocked = blockedTimes.includes(formattedTime);

        allSlots.push({
          time: formattedTime,
          isBooked: isBooked,
          isBlocked: isBlocked,
          isAvailable: !isBooked && !isBlocked,
          status: isBlocked ? "blocked" : isBooked ? "booked" : "available",
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
      blockedSlots: allSlots.filter((s) => s.isBlocked).length,
    });
  } catch (error) {
    console.error("Error getting slots for date:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllAppointments = async (req, res) => {
  try {
    const appointments = await appointmentModel
      .find({})
      .populate("serviceId")
      .sort({ createdAt: -1 });

    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const getUserAppointments = async (req, res) => {
  try {
    const userId = req.userId;

    console.log("Fetching appointments for userId:", userId);

    const appointments = await appointmentModel
      .find({
        userId: userId,
      })
      .populate("serviceId")
      .sort({ createdAt: -1 });

    console.log("Found appointments:", appointments.length);

    res.json({ success: true, appointments });
  } catch (error) {
    console.log("Error fetching user appointments:", error);
    res.json({ success: false, message: error.message });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    if (appointment.status === "cancelled") {
      return res.json({
        success: false,
        message: "Appointment already cancelled",
      });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      status: "cancelled",
    });

    console.log(`✅ Appointment cancelled: ${appointmentId}`);
    console.log(
      `✅ Slot freed globally: ${appointment.date} at ${appointment.time}`
    );

    res.json({
      success: true,
      message: "تم إلغاء الموعد بنجاح. الوقت متاح الآن للحجوزات الأخرى.",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const payAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    if (appointment.paid) {
      return res.json({ success: false, message: "Appointment already paid" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      paid: true,
      status: "confirmed",
    });

    res.json({ success: true, message: "Payment successful" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId, status } = req.body;

    const validStatuses = ["pending", "confirmed", "cancelled", "completed"];
    if (!validStatuses.includes(status)) {
      return res.json({ success: false, message: "Invalid status" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, { status });

    res.json({ success: true, message: "Appointment status updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

module.exports = {
  bookAppointment,
  checkSlotAvailability,
  getAllBookedSlots,
  getAvailableSlotsForDate,
  getAllAppointments,
  getUserAppointments,
  cancelAppointment,
  payAppointment,
  updateAppointmentStatus,
};
