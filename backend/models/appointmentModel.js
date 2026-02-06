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
      validate: {
        validator: function (value) {
          // Allow 0 amount for blocked slots, otherwise at least 1 EGP
          if (this.status === "blocked" && this.isBlockedSlot) {
            return value >= 0;
          }
          return value >= 1;
        },
        message: (props) => {
          if (
            props.value < 1 &&
            !(this.status === "blocked" && this.isBlockedSlot)
          ) {
            return "Amount must be at least 1 EGP";
          }
          return "Amount must be 0 or more for blocked slots";
        },
      },
    },
    answers: {
      type: Object,
      default: {},
    },

    // Admin confirmation fields
    adminConfirmed: {
      type: Boolean,
      default: false,
    },
    adminEmail: {
      type: String,
    },
    adminConfirmedAt: {
      type: Date,
    },

    // Blocked slots fields
    adminBlocked: {
      type: Boolean,
      default: false,
    },
    blockedBy: {
      type: String,
    },
    blockedAt: {
      type: Date,
    },
    isBlockedSlot: {
      type: Boolean,
      default: false,
    },
    blockReason: {
      type: String,
      default: "",
    },

    // Updated by
    updatedBy: {
      type: String,
    },

    // Currency conversion
    amountUSD: {
      type: Number,
      required: false,
    },
    exchangeRate: {
      type: Number,
      required: false,
    },

    // Payment information
    paymobOrderId: {
      type: String,
      index: true,
    },
    paymobTransactionId: {
      type: String,
      index: true,
    },
    paymobMerchantOrderId: {
      type: String,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["card", "wallet", "cash", null],
      default: null,
    },
    paymentDetails: {
      cardType: String,
      lastDigits: String,
      walletName: String,
    },
    paymentDate: {
      type: Date,
      index: true,
    },
    paymentInitiatedAt: {
      type: Date,
    },
    paymentAttempts: {
      type: Number,
      default: 0,
    },
    lastPaymentError: {
      type: String,
    },

    // Additional fields
    serviceName: {
      type: String,
      required: false,
    },
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

    // Audit fields
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },

    // Email tracking
    confirmationEmailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: {
      type: Date,
    },
    emailError: {
      type: String,
    },
    medicalInfo: {
      height: String,
      weight: String,
      age: String,
      chronicDiseases: String,
      currentMedications: String,
      currentHealthStatus: String,
      consultationGoal: String,
      medicationsFile: String, // path to uploaded file
      testsFile: String, // path to uploaded file
      otherDocuments: String, // path to uploaded file
    },
    answers: {
      type: Object,
      default: {},
    },

    // Admin tracking
    confirmedByAdmin: {
      type: Boolean,
      default: false,
    },
    adminId: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for formatted date
appointmentSchema.virtual("formattedDate").get(function () {
  return new Date(this.date).toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

// Virtual for payment status text
appointmentSchema.virtual("paymentStatusText").get(function () {
  if (this.paid) return "مدفوع";
  if (this.paymentAttempts > 0) return "محاولة دفع فاشلة";
  return "غير مدفوع";
});

// Virtual for admin confirmation text
appointmentSchema.virtual("confirmedByAdminText").get(function () {
  if (this.adminConfirmed)
    return `تم التأكيد بواسطة ${this.adminEmail || "الإدارة"}`;
  return "لم يتم التأكيد بعد";
});

// Indexes for better query performance
appointmentSchema.index({ userId: 1, status: 1 });
appointmentSchema.index({ paid: 1, status: 1 });
appointmentSchema.index({ date: 1, status: 1 });
appointmentSchema.index({ paymentDate: 1 });
appointmentSchema.index({ adminConfirmed: 1 });
appointmentSchema.index({ date: 1, time: 1, status: 1 });
appointmentSchema.index({ isBlockedSlot: 1 });
appointmentSchema.index({ status: 1, isBlockedSlot: 1 });

// Pre-save middleware
appointmentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to check slot availability
appointmentSchema.statics.isSlotAvailable = async function (date, time) {
  const existingAppointment = await this.findOne({
    date: date,
    time: time,
    status: { $nin: ["cancelled", "blocked"] }, // Exclude blocked slots
  });
  return !existingAppointment;
};

// Static method to get booked slots for a date
appointmentSchema.statics.getBookedSlotsForDate = function (date) {
  return this.find({
    date: date,
    status: { $nin: ["cancelled", "blocked"] },
    time: { $exists: true, $ne: "" },
  }).select("time");
};

// Static method to get blocked slots for a date
appointmentSchema.statics.getBlockedSlotsForDate = function (date) {
  return this.find({
    date: date,
    status: "blocked",
    isBlockedSlot: true,
    time: { $exists: true, $ne: "" },
  }).select("time");
};

// Instance method to mark as blocked
appointmentSchema.methods.markAsBlocked = function (adminEmail, reason = "") {
  this.status = "blocked";
  this.isBlockedSlot = true;
  this.blockedBy = adminEmail;
  this.blockedAt = new Date();
  this.blockReason = reason;
  this.updatedBy = `admin:${adminEmail}`;
  return this.save();
};

const appointmentModel =
  mongoose.models.appointment ||
  mongoose.model("appointment", appointmentSchema);

module.exports = appointmentModel;
