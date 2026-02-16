const Joi = require("joi");

const userValidation = {
  register: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      "string.empty": "الاسم مطلوب",
      "string.min": "الاسم يجب أن يكون على الأقل حرفين",
      "string.max": "الاسم لا يمكن أن يتجاوز 100 حرف",
    }),
    email: Joi.string().email().required().messages({
      "string.empty": "البريد الإلكتروني مطلوب",
      "string.email": "يرجى إدخال بريد إلكتروني صالح",
    }),
    password: Joi.string().min(8).required().messages({
      "string.empty": "كلمة المرور مطلوبة",
      "string.min": "كلمة المرور يجب أن تكون على الأقل 8 أحرف",
    }),
    phone: Joi.string()
      .pattern(/^[+]?[0-9\s\-\(\)]{8,20}$/)
      .required()
      .messages({
        "string.empty": "رقم الهاتف مطلوب",
        "string.pattern.base": "يرجى إدخال رقم هاتف صالح",
      }),
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      "string.empty": "البريد الإلكتروني مطلوب",
      "string.email": "يرجى إدخال بريد إلكتروني صالح",
    }),
    password: Joi.string().required().messages({
      "string.empty": "كلمة المرور مطلوبة",
    }),
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100).optional().messages({
      "string.min": "الاسم يجب أن يكون على الأقل حرفين",
      "string.max": "الاسم لا يمكن أن يتجاوز 100 حرف",
    }),
    phone: Joi.string()
      .pattern(/^[+]?[0-9\s\-\(\)]{8,20}$/)
      .optional()
      .messages({
        "string.pattern.base": "يرجى إدخال رقم هاتف صالح",
      }),
    gender: Joi.string()
      .valid("Male", "Female", "Other", "Not Selected")
      .optional(),
    dob: Joi.string().allow("").optional(),
    address: Joi.object({
      line1: Joi.string().allow("").optional(),
      line2: Joi.string().allow("").optional(),
      city: Joi.string().allow("").optional(),
      country: Joi.string().allow("").optional(),
      postalCode: Joi.string().allow("").optional(),
    }).optional(),
    image: Joi.string().optional(),
  }).min(1), // Require at least one field to update
};

module.exports = { userValidation };
