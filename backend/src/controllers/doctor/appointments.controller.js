const BaseController = require("../BaseController");
const Appointment = require("../../models/Appointment");
const MedicalService = require("../../models/MedicalService");
const { dateFormatter } = require("../../utils/helpers/date.formatter");

class DoctorAppointmentsController extends BaseController {
  constructor() {
    super();
    this.getDoctorAppointments = this.getDoctorAppointments.bind(this);
    this.getAppointmentDetails = this.getAppointmentDetails.bind(this);
    this.getAppointmentsByDate = this.getAppointmentsByDate.bind(this);
    this.getTodayAppointments = this.getTodayAppointments.bind(this);
    this.updateAppointmentStatus = this.updateAppointmentStatus.bind(this);
  }

  async getDoctorAppointments(req, res) {
    try {
      const { status, date, page = 1, limit = 20 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const query = {};

      if (status && status !== "all") {
        query.status = status;
      }

      if (date) {
        console.log(`Date filter: "${date}"`);

        // Convert ISO date to Arabic format for querying
        const arabicDate = dateFormatter.isoToArabic(date);
        if (arabicDate) {
          query.date = arabicDate;
        } else {
          // If not ISO, use as-is (assuming it's already Arabic format)
          query.date = date;
        }
      }

      const totalCount = await Appointment.countDocuments(query);
      const appointments = await Appointment.find(query)
        .populate("serviceId", "title title_ar category fees")
        .populate("userId", "name email phone")
        .sort({ date: 1, time: 1 })
        .skip(skip)
        .limit(parseInt(limit));

      // Transform appointments
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
        medicalInfo: appt.medicalInfo || {},
        userInfo: appt.userInfo || {},
      }));

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit)),
        hasNext: skip + appointments.length < totalCount,
        hasPrev: parseInt(page) > 1,
      };

      // Get statistics
      const stats = {
        pending: await Appointment.countDocuments({
          ...query,
          status: "pending",
        }),
        confirmed: await Appointment.countDocuments({
          ...query,
          status: "confirmed",
        }),
        completed: await Appointment.countDocuments({
          ...query,
          status: "completed",
        }),
        cancelled: await Appointment.countDocuments({
          ...query,
          status: "cancelled",
        }),
      };

      return this.paginatedResponse(
        res,
        transformedAppointments,
        pagination,
        "Appointments retrieved successfully",
        stats
      );
    } catch (error) {
      console.error("Get Doctor Appointments Error:", error);
      return this.error(res, error.message);
    }
  }

  async getAppointmentDetails(req, res) {
    try {
      const { id } = req.params;

      const appointment = await Appointment.findById(id)
        .populate("serviceId", "title title_ar category fees")
        .populate("userId", "name email phone");

      if (!appointment) {
        return this.notFound(res, "Appointment not found");
      }

      // Combine medical info from different possible sources
      const medicalInfo = {
        ...appointment.medicalInfo,
      };

      // Extract file URLs
      const files = {
        medicationsFile: appointment.medicalInfo?.medicationsFile || null,
        testsFile: appointment.medicalInfo?.testsFile || null,
      };

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
        medicalInfo: medicalInfo,
        userInfo: appointment.userInfo || {},
        files: files,
      };

      return this.success(
        res,
        { appointment: detailedAppointment },
        "Appointment details retrieved"
      );
    } catch (error) {
      console.error("Get Appointment Details Error:", error);
      return this.error(res, error.message);
    }
  }

  async getAppointmentsByDate(req, res) {
    try {
      let { date } = req.params;

      if (!date) {
        return this.badRequest(res, "Date is required");
      }

      // Convert ISO date to Arabic format if needed
      const arabicDate = dateFormatter.isoToArabic(date) || date;

      const appointments = await Appointment.find({
        date: arabicDate,
        status: { $nin: ["cancelled"] },
      })
        .populate("serviceId", "title title_ar")
        .populate("userId", "name email phone")
        .sort({ time: 1 });

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

      const byStatus = {
        pending: transformedAppointments.filter((a) => a.status === "pending")
          .length,
        confirmed: transformedAppointments.filter(
          (a) => a.status === "confirmed"
        ).length,
        completed: transformedAppointments.filter(
          (a) => a.status === "completed"
        ).length,
      };

      return this.success(
        res,
        {
          date: arabicDate,
          appointments: transformedAppointments,
          total: transformedAppointments.length,
          byStatus,
        },
        "Appointments retrieved successfully"
      );
    } catch (error) {
      console.error("Get Appointments By Date Error:", error);
      return this.error(res, error.message);
    }
  }

  async getTodayAppointments(req, res) {
    try {
      const today = new Date();
      const todayString = dateFormatter.toArabicDateString(today);

      const appointments = await Appointment.find({
        date: todayString,
        status: { $nin: ["cancelled"] },
      })
        .populate("serviceId", "title title_ar category fees")
        .populate("userId", "name email phone")
        .sort({ time: 1 });

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
      const tomorrowString = dateFormatter.toArabicDateString(tomorrow);
      const tomorrowAppointments = await Appointment.countDocuments({
        date: tomorrowString,
        status: { $nin: ["cancelled"] },
      });

      const stats = {
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
      };

      return this.success(
        res,
        {
          date: todayString,
          appointments: transformedAppointments,
          total: transformedAppointments.length,
          upcomingTomorrow: tomorrowAppointments,
          stats,
        },
        "Today's appointments retrieved"
      );
    } catch (error) {
      console.error("Get Today Appointments Error:", error);
      return this.error(res, error.message);
    }
  }

  async updateAppointmentStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, doctorNotes } = req.body;
      const doctorEmail = req.doctorEmail;

      if (
        !status ||
        !["pending", "confirmed", "completed", "cancelled"].includes(status)
      ) {
        return this.badRequest(res, "Valid status is required");
      }

      const appointment = await Appointment.findById(id);
      if (!appointment) {
        return this.notFound(res, "Appointment not found");
      }

      appointment.status = status;
      appointment.updatedBy = `doctor:${doctorEmail}`;

      if (doctorNotes) {
        appointment.doctorNotes = doctorNotes;
        appointment.doctorNotesAt = new Date();
      }

      await appointment.save();

      return this.success(
        res,
        {
          appointment,
          statusText: this.getStatusTextAr(status),
        },
        `Appointment status updated to ${status}`
      );
    } catch (error) {
      console.error("Update Appointment Status Error:", error);
      return this.error(res, error.message);
    }
  }

  getStatusTextAr(status) {
    const statusMap = {
      pending: "قيد الانتظار",
      confirmed: "مؤكد",
      completed: "مكتمل",
      cancelled: "ملغي",
    };
    return statusMap[status] || status;
  }
}

module.exports = new DoctorAppointmentsController();
