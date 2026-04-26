// controllers/admin/admin.controller.js
const BaseController = require("../BaseController");
const Appointment = require("../../models/Appointment");
const User = require("../../models/User");

// Use a dedicated BlockedSlot model — Appointment has required fields that
// conflict with creating simple blocked placeholder records.
let BlockedSlot;
try {
  BlockedSlot = require("../../models/Blockedslot");
} catch (e) {
  console.warn(
    "BlockedSlot model not found — slot blocking will use Appointment",
  );
}

// Safe optional requires — don't crash server if model file has issues
let Course, Product;
try {
  Course = require("../../models/Course");
} catch (e) {
  console.warn("Course model not loaded:", e.message);
}
try {
  Product = require("../../models/Product");
} catch (e) {
  console.warn("Product model not loaded:", e.message);
}

class AdminController extends BaseController {
  constructor() {
    super();
    [
      "getUsers",
      "getDashboardStats",
      "getAppointments",
      "updateAppointmentStatus",
      "getBlockedSlots",
      "blockSlot",
      "blockSlotRange",
      "unblockSlot",
    ].forEach((m) => (this[m] = this[m].bind(this)));
  }

  // ── GET /admin/users ───────────────────────────────────────────────────────
  async getUsers(req, res) {
    try {
      const { page = 1, limit = 50, search } = req.query;
      const query = {};

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);
      const [users, total] = await Promise.all([
        User.find(query)
          .select("-password")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        User.countDocuments(query),
      ]);

      return this.success(res, { users, total });
    } catch (err) {
      return this.error(res, err.message);
    }
  }

  // ── GET /admin/dashboard/stats ─────────────────────────────────────────────
  async getDashboardStats(req, res) {
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthStartISO = monthStart.toISOString().split("T")[0];
      const todayISO = now.toISOString().split("T")[0];

      // Run all counts in parallel
      const [
        totalAppointments,
        todayAppointments,
        statusAgg,
        totalUsers,
        newUsersThisMonth,
        totalCourses,
        totalProducts,
        revenueAgg,
      ] = await Promise.all([
        Appointment.countDocuments({ status: { $ne: "blocked" } }),
        Appointment.countDocuments({
          date: todayISO,
          status: { $ne: "blocked" },
        }),
        Appointment.aggregate([
          { $match: { status: { $nin: ["blocked"] } } },
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
        User.countDocuments({ role: { $ne: "admin" } }),
        User.countDocuments({
          role: { $ne: "admin" },
          createdAt: { $gte: monthStart },
        }),
        // Course and Product counts — safe if models aren't loaded
        Course && typeof Course.countDocuments === "function"
          ? Course.countDocuments()
          : Promise.resolve(0),
        Product && typeof Product.countDocuments === "function"
          ? Product.countDocuments()
          : Promise.resolve(0),
        // Revenue from paid appointments
        Appointment.aggregate([
          { $match: { paid: true } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
      ]);

      const statusMap = statusAgg.reduce((acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
      }, {});

      return this.success(res, {
        totalAppointments,
        todayAppointments,
        pendingAppointments: statusMap.pending || 0,
        confirmedAppointments: statusMap.confirmed || 0,
        completedAppointments: statusMap.completed || 0,
        cancelledAppointments: statusMap.cancelled || 0,
        totalUsers,
        newUsersThisMonth,
        totalCourses,
        totalProducts,
        totalRevenue: revenueAgg[0]?.total || 0,
      });
    } catch (err) {
      return this.error(res, err.message);
    }
  }

  // ── GET /admin/appointments ────────────────────────────────────────────────
  async getAppointments(req, res) {
    try {
      const { status, date, page = 1, limit = 50 } = req.query;
      const query = {};
      if (status && status !== "all") query.status = status;
      if (date) query.date = date;

      const skip = (Number(page) - 1) * Number(limit);
      const [appointments, total] = await Promise.all([
        Appointment.find(query)
          .populate("serviceId", "title title_ar category_ar fees")
          .populate("userId", "name email phone")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        Appointment.countDocuments(query),
      ]);

      const mapped = appointments.map((a) => ({
        ...a,
        service: a.serviceId || null,
        name: a.firstName
          ? `${a.firstName} ${a.lastName || ""}`.trim()
          : a.userId?.name || a.name || "",
      }));

      return this.success(res, { appointments: mapped, total });
    } catch (err) {
      return this.error(res, err.message);
    }
  }

  // ── POST /admin/appointments/status ───────────────────────────────────────
  async updateAppointmentStatus(req, res) {
    try {
      const { appointmentId, status } = req.body;
      const allowed = [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "no_show",
        "blocked",
      ];
      if (!allowed.includes(status))
        return this.badRequest(res, "حالة غير صالحة");

      const appointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        { status },
        { new: true },
      );
      if (!appointment) return this.notFound(res, "الموعد غير موجود");

      return this.success(res, { appointment }, "تم تحديث الحالة");
    } catch (err) {
      return this.error(res, err.message);
    }
  }

  // ── GET /admin/slots/blocked ───────────────────────────────────────────────
  async getBlockedSlots(req, res) {
    try {
      let slots = [];

      if (BlockedSlot) {
        // Read from dedicated BlockedSlot collection
        slots = await BlockedSlot.find({}).sort({ date: 1, time: 1 }).lean();
        console.log(
          `getBlockedSlots: found ${slots.length} in BlockedSlot collection`,
        );
      } else {
        // Fallback: try to load BlockedSlot dynamically in case it was registered after startup
        try {
          const mongoose = require("mongoose");
          // If mongoose already has the model registered
          const BS = mongoose.models.BlockedSlot;
          if (BS) {
            slots = await BS.find({}).sort({ date: 1, time: 1 }).lean();
            console.log(
              `getBlockedSlots: found ${slots.length} via mongoose.models.BlockedSlot`,
            );
          } else {
            // Last resort: check Appointment collection for isBlocked records
            slots = await Appointment.find({ isBlocked: true })
              .sort({ date: 1, time: 1 })
              .lean();
            console.log(
              `getBlockedSlots: found ${slots.length} isBlocked Appointments`,
            );
          }
        } catch (e2) {
          console.error("getBlockedSlots fallback error:", e2.message);
        }
      }

      return this.success(res, { slots });
    } catch (err) {
      return this.error(res, err.message);
    }
  }

  // ── POST /admin/slots/block ────────────────────────────────────────────────
  async blockSlot(req, res) {
    try {
      const { date, time, reason = "" } = req.body;
      if (!date || !time) return this.badRequest(res, "date و time مطلوبان");

      if (BlockedSlot) {
        // Use dedicated BlockedSlot model (no required fields conflict)
        try {
          const slot = await BlockedSlot.create({
            date,
            time,
            reason,
            blockedBy: "admin",
          });
          return this.success(res, { slot }, "تم حظر الموعد");
        } catch (dupErr) {
          if (dupErr.code === 11000)
            return this.conflict(res, "هذا الموعد محظور بالفعل");
          throw dupErr;
        }
      }

      // Fallback: use Appointment with all required fields filled
      const existing = await Appointment.findOne({
        date,
        time,
        status: "blocked",
      });
      if (existing) return this.conflict(res, "هذا الموعد محظور بالفعل");

      // Try to get a real service/user to satisfy required fields
      const anyService = await (
        require("../../models/MedicalService") ||
        require("../../models/Service")
      )
        .findOne()
        .lean()
        .catch(() => null);
      const anyUser = await User.findOne({ role: { $ne: "admin" } })
        .lean()
        .catch(() => null);

      const slot = new Appointment({
        date,
        dateISO: date,
        time,
        status: "confirmed", // use confirmed since "blocked" may not be in enum
        notes: reason || "Blocked by admin",
        blockedBy: "admin",
        isBlocked: true,
        firstName: "blocked",
        lastName: "slot",
        email: "blocked@system.com",
        phone: "0000000000",
        amount: 0,
        category: anyService?.category || "blocked",
        serviceId: anyService?._id,
        userId: anyUser?._id,
      });
      await slot.save();

      return this.success(res, { slot }, "تم حظر الموعد");
    } catch (err) {
      return this.error(res, err.message);
    }
  }

  // ── DELETE /admin/slots/unblock/:id ────────────────────────────────────────
  async unblockSlot(req, res) {
    try {
      const Model = BlockedSlot || Appointment;
      const slot = await Model.findByIdAndDelete(req.params.id);
      if (!slot) return this.notFound(res, "الموعد المحظور غير موجود");
      return this.success(res, null, "تم إلغاء الحظر");
    } catch (err) {
      return this.error(res, err.message);
    }
  }

  async blockSlotRange(req, res) {
    try {
      const { _bulk, reason = "" } = req.body;
      if (!_bulk) return this.blockSlot(req, res);

      const { dates, times } = _bulk;
      let count = 0;
      for (const date of dates) {
        for (const time of times) {
          const exists = await Appointment.findOne({
            date,
            time,
            status: "blocked",
          });
          if (!exists) {
            const slot = new Appointment({
              date,
              time,
              status: "blocked",
              notes: reason,
              blockedBy: "admin",
              firstName: "blocked",
              lastName: "slot",
              email: "blocked@system.com",
              phone: "0000000000",
              amount: 0,
            });
            await slot.save();
            count++;
          }
        }
      }
      return this.success(
        res,
        { blockedCount: count },
        `تم حظر ${count} موعد بنجاح`,
      );
    } catch (err) {
      return this.error(res, err.message);
    }
  }
}

module.exports = new AdminController();
