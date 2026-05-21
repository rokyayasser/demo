const Joi = require("joi");

const appointmentValidation = {
  create: Joi.object({
    serviceId: Joi.string().required().messages({
      "string.empty": "معرف الخدمة مطلوب",
    }),
    date: Joi.string().required().messages({
      "string.empty": "التاريخ مطلوب",
    }),
    time: Joi.string().allow("").optional(),
    category: Joi.string().required().messages({
      "string.empty": "فئة الخدمة مطلوبة",
    }),
    message: Joi.string().max(500).allow("").optional(),
    amount: Joi.number().min(0).required(),

    // Medical information
    height: Joi.string().required().messages({
      "string.empty": "الطول مطلوب",
    }),
    weight: Joi.string().required().messages({
      "string.empty": "الوزن مطلوب",
    }),
    age: Joi.string().required().messages({
      "string.empty": "العمر مطلوب",
    }),
    chronicDiseases: Joi.string().required().messages({
      "string.empty": "الأمراض المزمنة مطلوبة",
    }),
    currentMedications: Joi.string().allow("").optional(),
    currentHealthStatus: Joi.string().required().messages({
      "string.empty": "الحالة الصحية الحالية مطلوبة",
    }),
    consultationGoal: Joi.string().required().messages({
      "string.empty": "الهدف من الاستشارة مطلوب",
    }),

    currency: Joi.string().valid("EGP", "USD").optional().default("EGP"),
    currentMedications: Joi.string().allow("").optional(),
    // User information
    firstName: Joi.string().required().messages({
      "string.empty": "الاسم الأول مطلوب",
    }),
    lastName: Joi.string().required().messages({
      "string.empty": "اسم العائلة مطلوب",
    }),
    email: Joi.string().email().required().messages({
      "string.empty": "البريد الإلكتروني مطلوب",
      "string.email": "يرجى إدخال بريد إلكتروني صالح",
    }),
    phone: Joi.string()
      .pattern(/^[+]?[0-9\s\-\(\)]{8,20}$/)
      .required()
      .messages({
        "string.empty": "رقم الهاتف مطلوب",
        "string.pattern.base": "يرجى إدخال رقم هاتف صالح",
      }),
    country: Joi.string().allow("").optional(),
    city: Joi.string().allow("").optional(),
  }),

  updateStatus: Joi.object({
    status: Joi.string()
      .valid("pending", "confirmed", "cancelled", "completed", "no_show")
      .required()
      .messages({
        "any.only": "قيمة حالة غير صالحة",
        "string.empty": "الحالة مطلوبة",
      }),
    notes: Joi.string().max(1000).allow("").optional(),
    sendEmail: Joi.boolean().optional(),
  }),

  checkSlot: Joi.object({
    date: Joi.string().required().messages({
      "string.empty": "التاريخ مطلوب",
    }),
    time: Joi.string().required().messages({
      "string.empty": "الوقت مطلوب",
    }),
  }),
};

module.exports = { appointmentValidation };
