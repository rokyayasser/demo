const BaseController = require("../BaseController");
const Appointment = require("../../models/Appointment");
const MedicalService = require("../../models/MedicalService");
const {
  appointmentValidation,
} = require("../../middlewares/validation/appointment.validation");
const cloudinary = require("../../config/cloudinary");

class UserAppointmentsController extends BaseController {
  constructor() {
    super();
    this.getUserAppointments = this.getUserAppointments.bind(this);
    this.cancelAppointment = this.cancelAppointment.bind(this);
  }

  async getUserAppointments(req, res) {
    try {
      const userId = req.userId;
      const { status, page = 1, limit = 10 } = req.query;

      const query = { userId };
      if (status && status !== "all") {
        query.status = status;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const appointments = await Appointment.find(query)
        .populate("serviceId", "title title_ar category fees")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Appointment.countDocuments(query);

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
        appointments,
        pagination,
        "Appointments retrieved successfully"
      );
    } catch (error) {
      return this.error(res, error.message);
    }
  }

  async cancelAppointment(req, res) {
    try {
      const userId = req.userId;
      const { appointmentId } = req.body;

      if (!appointmentId) {
        return this.badRequest(res, "Appointment ID is required");
      }

      const appointment = await Appointment.findOne({
        _id: appointmentId,
        userId,
        status: { $in: ["pending", "confirmed"] },
      });

      if (!appointment) {
        return this.notFound(
          res,
          "Appointment not found or cannot be cancelled"
        );
      }

      appointment.status = "cancelled";
      await appointment.save();

      return this.success(
        res,
        { appointment },
        "Appointment cancelled successfully"
      );
    } catch (error) {
      return this.error(res, error.message);
    }
  }
}

module.exports = new UserAppointmentsController();
