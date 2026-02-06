const BaseController = require("../BaseController");
const Appointment = require("../../models/Appointment");
const appointmentService = require("../../services/appointment.service");
const emailService = require("../../services/email.service");
const {
  appointmentValidation,
} = require("../../middlewares/validation/appointment.validation");

class AdminAppointmentsController extends BaseController {
  constructor() {
    super();
    this.getAllAppointments = this.getAllAppointments.bind(this);
    this.updateAppointmentStatus = this.updateAppointmentStatus.bind(this);
  }

  async getAllAppointments(req, res) {
    try {
      const { status, date, page = 1, limit = 20, search } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const query = {};

      if (status && status !== "all") {
        query.status = status;
      }

      if (date) {
        query.date = date;
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ];
      }

      const appointments = await Appointment.find(query)
        .populate("serviceId", "title title_ar category fees")
        .populate("userId", "name email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Appointment.countDocuments(query);

      // Transform data for frontend
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
        service: appt.serviceId,
        createdAt: appt.createdAt,
        updatedAt: appt.updatedAt,
        isBlockedSlot: appt.isBlockedSlot || false,
        adminConfirmed: appt.adminConfirmed || false,
      }));

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        hasNext: skip + appointments.length < total,
        hasPrev: parseInt(page) > 1,
      };

      return this.paginatedResponse(
        res,
        transformedAppointments,
        pagination,
        "Appointments retrieved successfully"
      );
    } catch (error) {
      return this.error(res, error.message);
    }
  }

  async updateAppointmentStatus(req, res) {
    try {
      const adminEmail = req.adminEmail;
      const { appointmentId, status, sendEmail = false, notes } = req.body;

      // Validate input
      const { error } = appointmentValidation.updateStatus.validate({
        status,
        notes,
        sendEmail,
      });
      if (error) return this.validationError(res, error.details);

      // Update appointment status
      const appointment = await appointmentService.updateAppointmentStatus(
        appointmentId,
        status,
        adminEmail,
        notes
      );

      // Send confirmation email if requested
      let emailSent = false;
      if (sendEmail && status === "confirmed") {
        try {
          const user = (await User.findById(appointment.userId)) || {
            name: appointment.name,
            email: appointment.email,
            phone: appointment.phone,
          };

          const service = await MedicalService.findById(appointment.serviceId);

          const emailResult = await emailService.sendAppointmentConfirmation(
            appointment,
            user,
            service,
            true,
            adminEmail
          );

          emailSent = emailResult.success;

          if (emailSent) {
            appointment.confirmationEmailSent = true;
            appointment.emailSentAt = new Date();
            await appointment.save();
          }
        } catch (emailError) {
          console.error("Email sending error:", emailError);
        }
      }

      return this.success(
        res,
        {
          appointment,
          emailSent,
          statusText: this.getStatusTextAr(status),
        },
        `Appointment ${status} successfully`
      );
    } catch (error) {
      return this.error(res, error.message);
    }
  }

  getStatusTextAr(status) {
    const statusMap = {
      pending: "قيد الانتظار",
      confirmed: "مؤكد",
      completed: "مكتمل",
      cancelled: "ملغي",
      no_show: "لم يحضر",
      blocked: "محظور",
    };
    return statusMap[status] || status;
  }
}

module.exports = new AdminAppointmentsController();
