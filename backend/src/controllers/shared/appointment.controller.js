const BaseController = require("../BaseController");
const appointmentService = require("../../services/appointment.service");
const MedicalService = require("../../models/MedicalService");
const {
  appointmentValidation,
} = require("../../middlewares/validation/appointment.validation");

class SharedAppointmentController extends BaseController {
  constructor() {
    super();
    this.bookAppointment = this.bookAppointment.bind(this);
    this.checkSlotAvailability = this.checkSlotAvailability.bind(this);
    this.getAvailableSlots = this.getAvailableSlots.bind(this);
    this.getAllServices = this.getAllServices.bind(this);
    this.getServiceById = this.getServiceById.bind(this);
  }

  async bookAppointment(req, res) {
    try {
      const userId = req.userId;

      console.log("📥 Booking request received:");
      console.log("Body:", req.body);
      console.log("Files:", req.files);

      // Validate input
      const { error, value } = appointmentValidation.create.validate(req.body);
      if (error) {
        console.log("❌ Validation error:", error.details);
        return this.validationError(res, error.details);
      }

      // FIX: Multer stores files in req.files, not req.body
      // Access files from req.files after multer processes them
      if (req.files) {
        // Multer with .fields() returns an object with field names as keys
        // Each key contains an array of files
        if (req.files.medicationsFile && req.files.medicationsFile[0]) {
          value.medicationsFile = req.files.medicationsFile[0];
        }
        if (req.files.testsFile && req.files.testsFile[0]) {
          value.testsFile = req.files.testsFile[0];
        }
      }

      console.log("✅ Validated data:", {
        ...value,
        medicationsFile: value.medicationsFile?.originalname,
        testsFile: value.testsFile?.originalname,
      });

      // Create appointment
      const appointment = await appointmentService.createAppointment(
        value,
        userId,
      );

      return this.success(
        res,
        {
          appointment: {
            _id: appointment._id,
            date: appointment.date,
            time: appointment.time,
            status: appointment.status,
          },
        },
        "Appointment booked successfully",
      );
    } catch (error) {
      console.error("❌ Book Appointment Error:", error);

      if (error.message.includes("already booked")) {
        return this.conflict(res, "Time slot already booked");
      }
      if (error.message.includes("blocked")) {
        return this.conflict(res, "Time slot is blocked by admin");
      }
      if (error.message.includes("not available")) {
        return this.badRequest(res, "Service is not available");
      }
      if (error.message.includes("Service not found")) {
        return this.notFound(res, "Service not found");
      }

      return this.error(res, error.message);
    }
  }

  async checkSlotAvailability(req, res) {
    try {
      const { error, value } = appointmentValidation.checkSlot.validate(
        req.query,
      );
      if (error) return this.validationError(res, error.details);

      const { date, time } = value;

      const isAvailable = await appointmentService.checkSlotAvailability(
        date,
        time,
      );

      return this.success(res, {
        isAvailable,
        date,
        time,
        message: isAvailable ? "Slot is available" : "Slot is not available",
      });
    } catch (error) {
      return this.error(res, error.message);
    }
  }

  async getAvailableSlots(req, res) {
    try {
      const { date } = req.params;

      if (!date) {
        return this.badRequest(res, "Date is required");
      }

      const slots = await appointmentService.getAvailableSlots(date);

      return this.success(res, slots, "Available slots retrieved successfully");
    } catch (error) {
      return this.error(res, error.message);
    }
  }

  async getAllServices(req, res) {
    try {
      const { category, available, page = 1, limit = 10 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const query = {};
      if (category) query.category = category;
      if (available !== undefined) query.available = available === "true";

      const services = await MedicalService.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await MedicalService.countDocuments(query);

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        hasNext: skip + services.length < total,
        hasPrev: parseInt(page) > 1,
      };

      return this.paginatedResponse(
        res,
        services,
        pagination,
        "Services retrieved successfully",
      );
    } catch (error) {
      return this.error(res, error.message);
    }
  }

  async getServiceById(req, res) {
    try {
      const { id } = req.params;

      const service = await MedicalService.findById(id);
      if (!service) {
        return this.notFound(res, "Service not found");
      }

      return this.success(res, { service }, "Service retrieved successfully");
    } catch (error) {
      return this.error(res, error.message);
    }
  }

  async getBookedSlots(req, res) {
    try {
      const { date } = req.query;

      console.log("🔄 Getting booked slots for:", date || "all dates");

      const slotsData = await appointmentService.getBookedSlots(date || null);

      return res.status(200).json({
        success: true,
        message: "Booked slots retrieved successfully",
        bookedSlots: slotsData.bookedSlots || {},
        blockedSlots: slotsData.blockedSlots || {},
        total: slotsData.total || 0,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("❌ Error in getBookedSlots:", error);

      return res.status(500).json({
        success: false,
        message: error.message || "Failed to get booked slots",
        timestamp: new Date().toISOString(),
      });
    }
  }
}

module.exports = new SharedAppointmentController();
