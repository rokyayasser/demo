// controllers/doctor/doctor.controller.js
"use strict";
const BaseController = require("../BaseController");
const Appointment = require("../../models/Appointment");
const User = require("../../models/User");

let sendAppointmentStatusEmail;
try {
  ({ sendAppointmentStatusEmail } = require("../../services/email.service"));
} catch (e) {}

// ─── Date helpers ─────────────────────────────────────────────────────────────
const ARABIC_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];
const ARABIC_DAYS = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

const toArabicDate = (input) => {
  if (!input) return "";
  try {
    const d = input instanceof Date ? input : new Date(input);
    if (isNaN(d)) return String(input);
    return `${ARABIC_DAYS[d.getDay()]}، ${d.getDate()} ${ARABIC_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return String(input);
  }
};

const toISODate = (d = new Date()) => {
  const date = d instanceof Date ? d : new Date(d);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${mm}-${dd}`;
};

// ─── Smart date matcher ───────────────────────────────────────────────────────
// Builds ALL possible representations of a date so we match no matter
// what format was used when the appointment was booked.
//
// Handles these storage formats:
//   "2026-04-17"                    ISO date string (most common)
//   "2026-04-17T10:00:00.000Z"      Full ISO timestamp string
//   "الجمعة، 17 أبريل 2026"         Arabic string (legacy)
//   "17/04/2026"                    dd/mm/yyyy
//   ISODate(...)                    MongoDB Date object
const buildDateQuery = (isoDateStr) => {
  // isoDateStr = "2026-04-17"
  const d = new Date(isoDateStr);
  const isoPrefix = isoDateStr.substring(0, 10);
  const arabic = toArabicDate(isoDateStr);
  const [y, m, day] = isoPrefix.split("-");
  const ddmm = `${day}/${m}/${y}`; // "17/04/2026"
  const mmdd = `${m}/${day}/${y}`; // "04/17/2026"

  return {
    $or: [
      // 1. Exact ISO date string "2026-04-17"
      { date: isoPrefix },
      // 2. Full ISO timestamp string starts with the date
      { date: { $regex: `^${isoPrefix}` } },
      // 3. Arabic string
      { date: arabic },
      // 4. dd/mm/yyyy
      { date: ddmm },
      // 5. mm/dd/yyyy
      { date: mmdd },
      // 6. Actual MongoDB ISODate (Date object) — range covers the full day (UTC)
      {
        date: {
          $gte: new Date(`${isoPrefix}T00:00:00.000Z`),
          $lte: new Date(`${isoPrefix}T23:59:59.999Z`),
        },
      },
      // 7. Local midnight range (handles timezones) — add 24h buffer
      {
        date: {
          $gte: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
          $lte: new Date(
            d.getFullYear(),
            d.getMonth(),
            d.getDate(),
            23,
            59,
            59,
          ),
        },
      },
    ],
  };
};

const STATUS_AR = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  completed: "مكتمل",
  cancelled: "ملغي",
  no_show: "لم يحضر",
};

class DoctorController extends BaseController {
  constructor() {
    super();
    [
      "getAppointments",
      "getTodayAppointments",
      "getAppointmentsByDate",
      "getAppointmentDetails",
      "updateAppointmentStatus",
      "getCalendarView",
      "getStats",
      "debugDateFormats",
    ].forEach((m) => (this[m] = this[m].bind(this)));
  }

  // ── DEBUG ─────────────────────────────────────────────────────────────────
  // GET /doctor/debug/dates
  // Shows what date formats are actually stored in the DB
  async debugDateFormats(req, res) {
    try {
      const sample = await Appointment.find({ status: { $ne: "blocked" } })
        .select("date time status firstName")
        .limit(10)
        .lean();

      // Show unique date formats
      const uniqueFormats = [
        ...new Set(
          sample.map((a) => {
            if (!a.date) return "null";
            if (a.date instanceof Date)
              return `ISODate: ${a.date.toISOString()}`;
            return `string: "${a.date}"`;
          }),
        ),
      ];

      return this.success(res, {
        message: "These are the date formats stored in your DB",
        uniqueFormats,
        sample: sample.slice(0, 5),
        todayISO: toISODate(),
        todayArabic: toArabicDate(new Date()),
        queryExample: buildDateQuery(toISODate()),
      });
    } catch (err) {
      return this.error(res, err.message);
    }
  }

  // ── All appointments ───────────────────────────────────────────────────────
  async getAppointments(req, res) {
    try {
      const { status, date, page = 1, limit = 50 } = req.query;

      const filters = [{ status: { $ne: "blocked" } }];
      if (status && status !== "all") filters.push({ status });
      if (date) filters.push(buildDateQuery(date));

      const query = filters.length > 1 ? { $and: filters } : filters[0];
      const skip = (Number(page) - 1) * Number(limit);

      const [appointments, total] = await Promise.all([
        Appointment.find(query)
          .populate("serviceId", "title title_ar category_ar fees")
          .populate("userId", "name email phone image")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        Appointment.countDocuments(query),
      ]);

      return this.success(res, {
        appointments: this._map(appointments),
        total,
      });
    } catch (err) {
      return this.error(res, err.message);
    }
  }

  // ── Today ─────────────────────────────────────────────────────────────────
  async getTodayAppointments(req, res) {
    try {
      const todayISO = toISODate();
      const query = {
        $and: [{ status: { $ne: "blocked" } }, buildDateQuery(todayISO)],
      };

      const appointments = await Appointment.find(query)
        .populate("serviceId", "title title_ar category_ar fees duration")
        .sort({ time: 1 })
        .lean();

      return this.success(res, {
        appointments: this._map(appointments),
        total: appointments.length,
        date: todayISO,
      });
    } catch (err) {
      return this.error(res, err.message);
    }
  }

  // ── By date ───────────────────────────────────────────────────────────────
  async getAppointmentsByDate(req, res) {
    try {
      const { date } = req.params;
      if (!date) return this.badRequest(res, "date param required");

      const query = {
        $and: [{ status: { $ne: "blocked" } }, buildDateQuery(date)],
      };

      const appointments = await Appointment.find(query)
        .populate("serviceId", "title title_ar category_ar fees duration")
        .sort({ time: 1 })
        .lean();

      return this.success(res, {
        appointments: this._map(appointments),
        date,
      });
    } catch (err) {
      return this.error(res, err.message);
    }
  }

  // ── Details ───────────────────────────────────────────────────────────────
  async getAppointmentDetails(req, res) {
    try {
      const appointment = await Appointment.findById(req.params.id)
        .populate(
          "serviceId",
          "title title_ar category_ar fees duration features",
        )
        .populate("userId", "name email phone image gender dob city country")
        .lean();

      if (!appointment) return this.notFound(res, "الموعد غير موجود");

      return this.success(res, {
        appointment: {
          ...appointment,
          service: appointment.serviceId || null,
          userInfo: appointment.userId || null,
          name: appointment.firstName
            ? `${appointment.firstName} ${appointment.lastName || ""}`.trim()
            : appointment.userId?.name || appointment.name || "",
        },
      });
    } catch (err) {
      return this.error(res, err.message);
    }
  }

  // ── Update status + send email ────────────────────────────────────────────
  async updateAppointmentStatus(req, res) {
    try {
      const { status, doctorNotes } = req.body;
      const allowed = [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "no_show",
      ];
      if (!allowed.includes(status))
        return this.badRequest(res, "حالة غير صالحة");

      const update = { status };
      if (doctorNotes !== undefined) {
        update.doctorNotes = doctorNotes;
        update.doctorNotesAt = new Date();
      }

      const appointment = await Appointment.findByIdAndUpdate(
        req.params.id,
        update,
        { new: true },
      )
        .populate("serviceId", "title title_ar fees")
        .populate("userId", "name email");

      if (!appointment) return this.notFound(res, "الموعد غير موجود");

      this._sendStatusEmail(appointment, status).catch(console.error);

      return this.success(res, { appointment }, "تم تحديث الحالة");
    } catch (err) {
      return this.error(res, err.message);
    }
  }

  // ── Calendar view ─────────────────────────────────────────────────────────
  async getCalendarView(req, res) {
    try {
      const month = Number(req.query.month) || new Date().getMonth() + 1;
      const year = Number(req.query.year) || new Date().getFullYear();

      const startISO = `${year}-${String(month).padStart(2, "0")}-01`;
      const endDay = new Date(year, month, 0).getDate();
      const endISO = `${year}-${String(month).padStart(2, "0")}-${String(endDay).padStart(2, "0")}`;

      const startDate = new Date(`${startISO}T00:00:00.000Z`);
      const endDate = new Date(`${endISO}T23:59:59.999Z`);

      const appointments = await Appointment.find({
        $and: [
          { status: { $ne: "blocked" } },
          {
            $or: [
              // ISO string range
              { date: { $gte: startISO, $lte: endISO + "\uffff" } },
              // ISODate object range
              { date: { $gte: startDate, $lte: endDate } },
              // Arabic string — harder to range, just fetch and filter
              { date: { $regex: ARABIC_MONTHS[month - 1] } },
            ],
          },
        ],
      })
        .populate("serviceId", "title_ar title")
        .sort({ date: 1, time: 1 })
        .lean();

      // Normalize and group by date key
      const byDate = {};
      for (const apt of appointments) {
        let key = apt.date;
        // Normalize any format to "YYYY-MM-DD"
        if (apt.date instanceof Date) {
          key = toISODate(apt.date);
        } else if (typeof apt.date === "string") {
          if (apt.date.includes("T")) key = apt.date.substring(0, 10);
          else if (apt.date.includes("،")) {
            // Arabic: try to reverse-parse
            const parsed = new Date(apt.date);
            if (!isNaN(parsed)) key = toISODate(parsed);
          }
        }
        if (!byDate[key]) byDate[key] = [];
        byDate[key].push({
          _id: apt._id,
          time: apt.time,
          status: apt.status,
          name: apt.firstName
            ? `${apt.firstName} ${apt.lastName || ""}`.trim()
            : apt.name || "",
          service: apt.serviceId?.title_ar || apt.serviceId?.title || "",
        });
      }

      const stats = appointments.reduce((acc, a) => {
        acc[a.status] = (acc[a.status] || 0) + 1;
        return acc;
      }, {});

      return this.success(res, {
        calendarDays: Object.entries(byDate).map(([date, apts]) => ({
          date,
          appointments: apts,
        })),
        monthlyStats: {
          total: appointments.length,
          pending: stats.pending || 0,
          confirmed: stats.confirmed || 0,
          completed: stats.completed || 0,
          cancelled: stats.cancelled || 0,
        },
      });
    } catch (err) {
      return this.error(res, err.message);
    }
  }

  // ── Stats ─────────────────────────────────────────────────────────────────
  async getStats(req, res) {
    try {
      const now = new Date();
      const todayISO = toISODate(now);
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      const weekStartISO = toISODate(weekStart);
      const monthStartISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

      const notBlocked = { status: { $ne: "blocked" } };

      const [total, todayCount, weekCount, monthCount, statusAgg] =
        await Promise.all([
          Appointment.countDocuments(notBlocked),
          Appointment.countDocuments({
            $and: [notBlocked, buildDateQuery(todayISO)],
          }),
          Appointment.countDocuments({
            $and: [
              notBlocked,
              {
                $or: [
                  { date: { $gte: weekStartISO } },
                  { date: { $gte: new Date(`${weekStartISO}T00:00:00.000Z`) } },
                ],
              },
            ],
          }),
          Appointment.countDocuments({
            $and: [
              notBlocked,
              {
                $or: [
                  { date: { $gte: monthStartISO } },
                  {
                    date: { $gte: new Date(`${monthStartISO}T00:00:00.000Z`) },
                  },
                ],
              },
            ],
          }),
          Appointment.aggregate([
            { $match: { status: { $nin: ["blocked"] } } },
            { $group: { _id: "$status", count: { $sum: 1 } } },
          ]),
        ]);

      const sm = statusAgg.reduce(
        (acc, { _id, c }) => ({ ...acc, [_id]: c }),
        {},
      );
      const completed = sm.completed || 0;
      const completionRate = total ? Math.round((completed / total) * 100) : 0;

      return this.success(res, {
        totalAppointments: total,
        today: todayCount,
        thisWeek: weekCount,
        thisMonth: monthCount,
        pending: sm.pending || 0,
        confirmed: sm.confirmed || 0,
        completed,
        cancelled: sm.cancelled || 0,
        completionRate,
        averageDaily:
          monthCount > 0 ? Math.round(monthCount / now.getDate()) : 0,
      });
    } catch (err) {
      return this.error(res, err.message);
    }
  }

  // ── Private ───────────────────────────────────────────────────────────────
  _map(appointments) {
    return appointments.map((a) => ({
      ...a,
      service: a.serviceId || null,
      userInfo: a.userId || null,
      name: a.firstName
        ? `${a.firstName} ${a.lastName || ""}`.trim()
        : a.userId?.name || a.name || "",
    }));
  }

  async _sendStatusEmail(appointment, status) {
    if (!sendAppointmentStatusEmail) return;
    try {
      const userEmail = appointment.userId?.email || appointment.email;
      const userName =
        appointment.userId?.name ||
        `${appointment.firstName || ""} ${appointment.lastName || ""}`.trim() ||
        "العميل";
      if (!userEmail) return;
      const service = appointment.serviceId;
      const frontendUrl =
        process.env.USER_FRONTEND_URL || "http://localhost:5173";
      await sendAppointmentStatusEmail({
        toEmail: userEmail,
        userName,
        status,
        statusAr: STATUS_AR[status] || status,
        serviceName: service?.title_ar || service?.title || "الخدمة",
        date: appointment.date,
        time: appointment.time,
        doctorNotes: appointment.doctorNotes || "",
        appointmentUrl: `${frontendUrl}/my-appointments`,
      });
    } catch (err) {
      console.error("_sendStatusEmail:", err.message);
    }
  }
}

module.exports = new DoctorController();
