const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "medicalService",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    time: {
      type: String,
      required: false,
      index: true,
    },
    category: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
        "no_show",
        "blocked",
      ],
      default: "pending",
      index: true,
    },
    paid: {
      type: Boolean,
      default: false,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },

    // Medical information
    medicalInfo: {
      height: String,
      weight: String,
      age: String,
      chronicDiseases: String,
      currentMedications: String,
      currentHealthStatus: String,
      consultationGoal: String,
      medicationsFile: String,
      testsFile: String,
    },

    // User information from form
    userInfo: {
      firstName: String,
      lastName: String,
      country: String,
      city: String,
    },

    // Admin/Doctor tracking
    adminConfirmed: {
      type: Boolean,
      default: false,
    },
    adminEmail: String,
    adminConfirmedAt: Date,

    // Blocked slots fields
    adminBlocked: {
      type: Boolean,
      default: false,
    },
    blockedBy: String,
    blockedAt: Date,
    isBlockedSlot: {
      type: Boolean,
      default: false,
    },
    blockReason: {
      type: String,
      default: "",
    },

    // Payment information
    paymobOrderId: String,
    paymobTransactionId: String,
    paymobMerchantOrderId: String,
    paymentMethod: {
      type: String,
      enum: ["card", "wallet", "cash", null],
      default: null,
    },
    paymentDate: Date,

    // Service details
    serviceName: String,
    doctorName: {
      type: String,
      default: "الدكتور الخطيب",
    },
    location: {
      type: String,
      default: "عيادة الخطيب فارما",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
appointmentSchema.index({ userId: 1, status: 1 });
appointmentSchema.index({ date: 1, time: 1 });
appointmentSchema.index({ status: 1, isBlockedSlot: 1 });
appointmentSchema.index({ paid: 1, status: 1 });
appointmentSchema.index({ date: 1, status: 1 });
appointmentSchema.index({ isBlockedSlot: 1 });
appointmentSchema.index({ createdAt: -1 });

// Virtuals
appointmentSchema.virtual("fullName").get(function () {
  return `${this.userInfo?.firstName || ""} ${this.userInfo?.lastName || ""}`.trim();
});

appointmentSchema.virtual("status_ar").get(function () {
  const statusMap = {
    pending: "قيد الانتظار",
    confirmed: "مؤكد",
    cancelled: "ملغي",
    completed: "مكتمل",
    no_show: "لم يحضر",
    blocked: "محظور",
  };
  return statusMap[this.status] || this.status;
});

appointmentSchema.virtual("paymentStatus").get(function () {
  return this.paid ? "مدفوع" : "غير مدفوع";
});

// Methods
appointmentSchema.methods.markAsBlocked = function (adminEmail, reason = "") {
  this.status = "blocked";
  this.isBlockedSlot = true;
  this.blockedBy = adminEmail;
  this.blockedAt = new Date();
  this.blockReason = reason;
  this.adminBlocked = true;
  return this.save();
};

// Static methods
appointmentSchema.statics.isSlotAvailable = async function (date, time) {
  const existingAppointment = await this.findOne({
    date: date,
    time: time,
    status: { $nin: ["cancelled", "blocked"] },
  });
  return !existingAppointment;
};

const Appointment =
  mongoose.models.appointment ||
  mongoose.model("appointment", appointmentSchema);

module.exports = Appointment;
