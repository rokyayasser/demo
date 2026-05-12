// controllers/shared/appointment.controller.js
const BaseController = require("../BaseController");
const MedicalService = require("../../models/MedicalService");
const Appointment = require("../../models/Appointment");
const {
  appointmentValidation,
} = require("../../middlewares/validation/appointment.validation");
const cloudinary = require("../../config/cloudinary");

// Paymob loaded safely — missing config never crashes the controller
let PaymobService = null;
try {
  PaymobService = require("../../config/paymob");
  if (typeof PaymobService === "function") PaymobService = new PaymobService();
  console.log("✅ Paymob loaded in appointment controller");
} catch (e) {
  console.warn("Paymob not loaded in appointment controller:", e.message);
}

// ── Fix 1: correct path ──────────────────────────────────────────────────────
let BlockedSlot;
try {
  BlockedSlot = require("../../models/BlockedSlot"); // was "../models/BlockedSlot" ← wrong
} catch (e) {
  console.warn("BlockedSlot model not found:", e.message);
}

// ── Fix 2: standalone function (not a class method) so getBookedSlots can call it ──
const normalizeDate = (date) => {
  if (!date) return null;
  if (date instanceof Date) return date.toISOString().substring(0, 10);
  if (typeof date === "string") {
    if (/^\d{4}-\d{2}-\d{2}/.test(date)) return date.substring(0, 10);
    const parsed = new Date(date);
    if (!isNaN(parsed)) return parsed.toISOString().substring(0, 10);
  }
  return null;
};

// ── Arabic date → ISO ────────────────────────────────────────────────────────
const arabicDateToISO = (arabicDate) => {
  try {
    const arabicNumbers = {
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
    let englishDate = arabicDate;
    for (const [a, e] of Object.entries(arabicNumbers)) {
      englishDate = englishDate.replace(new RegExp(a, "g"), e);
    }
    const monthNames = {
      يناير: "01",
      فبراير: "02",
      مارس: "03",
      أبريل: "04",
      مايو: "05",
      يونيو: "06",
      يوليو: "07",
      أغسطس: "08",
      سبتمبر: "09",
      أكتوبر: "10",
      نوفمبر: "11",
      ديسمبر: "12",
    };
    let month = "";
    for (const [arabicMonth, num] of Object.entries(monthNames)) {
      if (englishDate.includes(arabicMonth)) {
        month = num;
        break;
      }
    }
    const dayMatch = englishDate.match(/(\d+)/);
    const yearMatch = englishDate.match(/(\d{4})/);
    if (dayMatch && yearMatch && month) {
      return `${yearMatch[1]}-${month}-${dayMatch[1].padStart(2, "0")}`;
    }
    return null;
  } catch (error) {
    console.error("Error converting Arabic date:", error);
    return null;
  }
};

class SharedAppointmentController extends BaseController {
  constructor() {
    super();
    this.getAllServices = this.getAllServices.bind(this);
    this.getServiceById = this.getServiceById.bind(this);
    this.getAvailableSlots = this.getAvailableSlots.bind(this);
    this.checkSlotAvailability = this.checkSlotAvailability.bind(this);
    this.getBookedSlots = this.getBookedSlots.bind(this);
    this.bookAppointment = this.bookAppointment.bind(this);
  }

  async getAllServices(req, res) {
    try {
      const { category, available, page = 1, limit = 10 } = req.query;
      const query = {};
      if (category) query.category = category;
      if (available === "true") query.available = true;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const services = await MedicalService.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      const total = await MedicalService.countDocuments(query);
      return this.paginatedResponse(
        res,
        services,
        {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
          hasNext: skip + services.length < total,
          hasPrev: parseInt(page) > 1,
        },
        "Services retrieved successfully",
      );
    } catch (error) {
      return this.error(res, error.message);
    }
  }

  async getServiceById(req, res) {
    try {
      const service = await MedicalService.findById(req.params.id);
      if (!service) return this.notFound(res, "Service not found");
      return this.success(res, service, "Service retrieved successfully");
    } catch (error) {
      return this.error(res, error.message);
    }
  }

  async getAvailableSlots(req, res) {
    try {
      const { date } = req.params;
      const services = await MedicalService.find({ available: true });
      const dateISO = arabicDateToISO(date);
      const appointments = await Appointment.find({
        dateISO: dateISO,
        status: { $nin: ["cancelled"] },
      });
      const bookedTimes = appointments.map((apt) => apt.time);
      let blockedSlots = [];
      services.forEach((service) => {
        if (service.slots_booked && service.slots_booked[date]) {
          blockedSlots = [...blockedSlots, ...service.slots_booked[date]];
        }
      });
      // Also include BlockedSlot model entries for this date
      if (BlockedSlot && dateISO) {
        const adminBlocked = await BlockedSlot.find({ date: dateISO })
          .select("time")
          .lean();
        blockedSlots = [...blockedSlots, ...adminBlocked.map((b) => b.time)];
      }
      const unavailableSlots = [...new Set([...bookedTimes, ...blockedSlots])];
      const allSlots = [];
      for (let hour = 9; hour <= 20; hour++) {
        for (const minute of [0, 30]) {
          if (hour === 20 && minute === 30) continue;
          allSlots.push(
            `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
          );
        }
      }
      const availableSlots = allSlots.filter(
        (slot) => !unavailableSlots.includes(slot),
      );
      return this.success(
        res,
        {
          date,
          slots: availableSlots,
          unavailableSlots,
          totalSlots: allSlots.length,
          availableCount: availableSlots.length,
        },
        "Available slots retrieved",
      );
    } catch (error) {
      return this.error(res, error.message);
    }
  }

  async checkSlotAvailability(req, res) {
    try {
      const { date, time } = req.query;
      if (!date || !time)
        return this.badRequest(res, "Date and time are required");
      const dateISO = arabicDateToISO(date);

      // Check booked appointment
      const existingAppointment = await Appointment.findOne({
        dateISO: dateISO,
        time: time,
        status: { $nin: ["cancelled"] },
      });

      // ── Fix 3: also check BlockedSlot model ──────────────────────────────
      let isAdminBlocked = false;
      if (BlockedSlot && dateISO) {
        const blocked = await BlockedSlot.findOne({ date: dateISO, time });
        isAdminBlocked = !!blocked;
      }

      const isAvailable = !existingAppointment && !isAdminBlocked;
      return this.success(res, {
        isAvailable,
        date,
        time,
        message: isAvailable
          ? "Slot is available"
          : isAdminBlocked
            ? "هذا الوقت مغلق من قِبل الإدارة"
            : "هذا الوقت محجوز بالفعل",
      });
    } catch (error) {
      return this.error(res, error.message);
    }
  }

  // ── Fix 4: getBookedSlots uses dateISO field + standalone normalizeDate ───
  async getBookedSlots(req, res) {
    try {
      const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);

      // Only treat a slot as booked if payment is confirmed or in progress.
      // Stale pending+unpaid (older than 30 min) are ignored so they
      // don't block the calendar after an abandoned payment.
      const bookedAppointments = await Appointment.find({
        $or: [
          { paid: true },
          { status: "confirmed" },
          { status: "completed" },
          { status: "pending", paid: false, createdAt: { $gt: thirtyMinAgo } },
        ],
      })
        .select("date dateISO time")
        .lean();

      const bookedSlots = {};
      for (const apt of bookedAppointments) {
        // ── Use dateISO first (already normalized), fall back to normalizing date ──
        const key = apt.dateISO || normalizeDate(apt.date);
        if (!key) continue;
        if (!bookedSlots[key]) bookedSlots[key] = [];
        if (apt.time && !bookedSlots[key].includes(apt.time))
          bookedSlots[key].push(apt.time);
      }

      const blockedSlots = {};
      if (BlockedSlot) {
        const blocked = await BlockedSlot.find({}).select("date time").lean();
        for (const b of blocked) {
          const key = b.date; // already "YYYY-MM-DD"
          if (!key) continue;
          if (!blockedSlots[key]) blockedSlots[key] = [];
          if (b.time && !blockedSlots[key].includes(b.time))
            blockedSlots[key].push(b.time);
        }
        console.log(
          `✅ getBookedSlots: ${blocked.length} admin-blocked slots loaded`,
        );
      } else {
        console.warn(
          "⚠️ BlockedSlot model not loaded — admin blocks won't show to users",
        );
      }

      return res.json({ success: true, data: { bookedSlots, blockedSlots } });
    } catch (err) {
      console.error("getBookedSlots error:", err.message);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async bookAppointment(req, res) {
    try {
      const { error, value } = appointmentValidation.create.validate(req.body);
      if (error) return this.validationError(res, error.details);

      const {
        serviceId,
        date,
        time,
        category,
        amount,
        firstName,
        lastName,
        email,
        phone,
        country,
        city,
        message,
        height,
        weight,
        age,
        chronicDiseases,
        currentMedications,
        currentHealthStatus,
        consultationGoal,
      } = value;

      const userId = req.userId;
      const dateISO = arabicDateToISO(date);
      if (!dateISO) return this.badRequest(res, "Invalid date format");

      const service = await MedicalService.findById(serviceId);
      if (!service) return this.notFound(res, "الخدمة غير موجودة");
      if (!service.available)
        return this.conflict(res, "هذه الخدمة غير متاحة حالياً");

      // ── Check existing appointment ─────────────────────────────────────────
      // Only block the slot if there is a PAID or CONFIRMED appointment.
      // Pending + unpaid appointments don't hold the slot — otherwise a user
      // who starts payment and abandons it blocks the slot forever.
      // Stale pending appointments (older than 30 min) are also ignored.
      const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
      const existingAppointment = await Appointment.findOne({
        serviceId,
        dateISO,
        time,
        status: { $nin: ["cancelled"] },
        $or: [
          { paid: true }, // paid → slot is taken
          { status: "confirmed" }, // confirmed by doctor → taken
          { status: "completed" }, // completed → taken
          {
            // pending within last 30 min → temporarily hold
            status: "pending",
            paid: false,
            createdAt: { $gt: thirtyMinAgo },
          },
        ],
      });
      if (existingAppointment)
        return this.conflict(res, "هذا الموعد محجوز بالفعل");

      // ── Clean up stale pending unpaid appointments for this slot ──────────
      // If there's a pending+unpaid appointment older than 30 min, cancel it
      // so it doesn't appear in the doctor's list as a ghost booking.
      await Appointment.updateMany(
        {
          serviceId,
          dateISO,
          time,
          status: "pending",
          paid: false,
          createdAt: { $lt: thirtyMinAgo },
        },
        { $set: { status: "cancelled" } },
      );

      // ── Fix 5: check BlockedSlot before booking ───────────────────────────
      if (BlockedSlot) {
        const adminBlocked = await BlockedSlot.findOne({ date: dateISO, time });
        if (adminBlocked)
          return this.conflict(
            res,
            "هذا الوقت مغلق من قِبل الإدارة ولا يمكن حجزه",
          );
      }

      if (service.slots_booked?.[date]?.includes(time))
        return this.conflict(res, "هذا الوقت غير متاح للحجز");

      // ── File uploads ─────────────────────────────────────────────────────────
      let medicationsFileUrl = null;
      let testsFileUrls = []; // supports multiple test files

      if (req.files && cloudinary) {
        // Single medications file — use uploadImage (the method that exists)
        if (req.files.medicationsFile?.[0]) {
          try {
            const f = req.files.medicationsFile[0];
            const r = await cloudinary.uploadImage(
              f.buffer,
              "appointments/medications",
            );
            if (r?.secure_url) medicationsFileUrl = r.secure_url;
          } catch (e) {
            console.error("medications upload error:", e.message);
          }
        }

        // Multiple test files — only push entries where upload succeeded
        if (req.files.testsFile?.length) {
          for (const f of req.files.testsFile) {
            try {
              const r = await cloudinary.uploadImage(
                f.buffer,
                "appointments/tests",
              );
              if (r?.secure_url) {
                testsFileUrls.push({
                  url: r.secure_url,
                  name: f.originalname || "test-file",
                });
              }
            } catch (e) {
              console.error("test file upload error:", e.message);
            }
          }
        }
      }

      const appointment = new Appointment({
        userId,
        serviceId,
        date,
        dateISO,
        time,
        category,
        amount,
        firstName,
        lastName,
        email,
        phone,
        country: country || "",
        city: city || "",
        message: message || "",
        height,
        weight,
        age,
        chronicDiseases,
        currentMedications:
          req.body.currentMedications || currentMedications || "",
        currentHealthStatus,
        consultationGoal,
        medicationsFile: medicationsFileUrl,
        testsFiles: testsFileUrls.filter((f) => f.url), // only keep successful uploads
        status: "pending",
        paid: false,
      });
      await appointment.save();

      service.meta.bookings = (service.meta.bookings || 0) + 1;
      await service.save();

      // ── Initiate Paymob payment if service has fees ─────────────────────────
      if (Number(amount) > 0 && PaymobService) {
        try {
          // Always charge in EGP — the EGP amount is stored in service.fees
          // USD shown on the frontend is display-only (live exchange rate)
          // To enable real USD payments, set PAYMOB_USD_INTEGRATION_ID in env
          const egpAmount = Number(service.fees); // always use original EGP price
          const fullName = `${firstName} ${lastName}`.trim();

          const paymobData = await PaymobService.initiatePayment(
            appointment._id.toString(),
            egpAmount,
            { name: fullName, email, phone },
            [],
            "EGP", // always EGP until USD integration is configured
          );

          return this.success(
            res,
            {
              appointment,
              appointmentId: appointment._id,
              paymentUrl: paymobData.paymentUrl,
              iframeUrl: paymobData.iframeUrl,
              currency: "EGP",
              requiresPayment: true,
            },
            "تم حجز الموعد — أكمل الدفع",
          );
        } catch (paymobErr) {
          console.error(
            "Paymob error — deleting appointment:",
            paymobErr.message,
          );

          // DELETE the appointment so the slot is freed.
          // The user should not be booked without completing payment.
          try {
            await Appointment.findByIdAndDelete(appointment._id);
            // Also undo the bookings counter
            service.meta.bookings = Math.max(
              0,
              (service.meta.bookings || 1) - 1,
            );
            await service.save();
          } catch (cleanupErr) {
            console.error("Cleanup error:", cleanupErr.message);
          }

          return this.error(
            res,
            "فشل في إنشاء رابط الدفع — لم يتم تأكيد الحجز. يرجى المحاولة مرة أخرى أو التواصل معنا.",
            400,
          );
        }
      }

      // Free service (no fees) — confirm directly without payment
      return this.success(
        res,
        { appointment, appointmentId: appointment._id },
        "تم حجز الموعد بنجاح",
      );
    } catch (error) {
      console.error("Book appointment error:", error);
      return this.error(res, error.message);
    }
  }
}

module.exports = new SharedAppointmentController();
