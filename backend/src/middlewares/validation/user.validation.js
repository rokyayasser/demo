// middlewares/validation/user.validation.js
const Joi = require("joi");

// ─── Reusable sub-schemas ─────────────────────────────────────────────────────
const addressSchema = Joi.alternatives()
  .try(
    Joi.string().allow("").optional(),
    Joi.object({
      line1: Joi.string().allow("").optional(),
      line2: Joi.string().allow("").optional(),
      city: Joi.string().allow("").optional(),
      country: Joi.string().allow("").optional(),
      postalCode: Joi.string().allow("").optional(),
    }),
  )
  .optional();

const genderSchema = Joi.string()
  .valid("ذكر", "أنثي", "Male", "Female", "غير محدد")
  .optional()
  .messages({ "any.only": "يرجى اختيار الجنس بشكل صحيح" });

const dateSchema = Joi.alternatives()
  .try(Joi.date(), Joi.string().allow(""))
  .optional();

const numericSchema = Joi.alternatives()
  .try(
    Joi.number(),
    Joi.string()
      .pattern(/^\d+(\.\d+)?$/)
      .allow(""),
  )
  .optional();

// ─── Schemas ──────────────────────────────────────────────────────────────────
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "الاسم مطلوب",
    "string.min": "الاسم يجب أن يكون على الأقل حرفين",
    "string.max": "الاسم لا يمكن أن يتجاوز 100 حرف",
    "any.required": "الاسم مطلوب",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "البريد الإلكتروني مطلوب",
    "string.email": "يرجى إدخال بريد إلكتروني صالح",
    "any.required": "البريد الإلكتروني مطلوب",
  }),
  password: Joi.string().min(8).required().messages({
    "string.empty": "كلمة المرور مطلوبة",
    "string.min": "كلمة المرور يجب أن تكون على الأقل 8 أحرف",
    "any.required": "كلمة المرور مطلوبة",
  }),
  phone: Joi.string()
    .pattern(/^[+]?[0-9\s\-\(\)]{8,20}$/)
    .required()
    .messages({
      "string.empty": "رقم الهاتف مطلوب",
      "string.pattern.base": "يرجى إدخال رقم هاتف صالح",
      "any.required": "رقم الهاتف مطلوب",
    }),
  address: addressSchema,
  gender: genderSchema,
  birthdate: dateSchema,
  dob: dateSchema,
  height: numericSchema,
  weight: numericSchema,
  city: Joi.string().allow("").optional(),
  country: Joi.string().allow("").optional(),
  healthGoal: Joi.string().allow("").optional(),
  chronicDiseases: Joi.string().allow("").optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "البريد الإلكتروني مطلوب",
    "string.email": "يرجى إدخال بريد إلكتروني صالح",
    "any.required": "البريد الإلكتروني مطلوب",
  }),
  password: Joi.string().required().messages({
    "string.empty": "كلمة المرور مطلوبة",
    "any.required": "كلمة المرور مطلوبة",
  }),
});

const updateSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional().messages({
    "string.min": "الاسم يجب أن يكون على الأقل حرفين",
    "string.max": "الاسم لا يمكن أن يتجاوز 100 حرف",
  }),
  phone: Joi.string()
    .pattern(/^[+]?[0-9\s\-\(\)]{8,20}$/)
    .optional()
    .messages({ "string.pattern.base": "يرجى إدخال رقم هاتف صالح" }),
  address: addressSchema,
  gender: genderSchema,
  birthdate: dateSchema,
  dob: dateSchema,
  height: numericSchema,
  weight: numericSchema,
  city: Joi.string().allow("").optional(),
  country: Joi.string().allow("").optional(),
  healthGoal: Joi.string().allow("").optional(),
  chronicDiseases: Joi.string().allow("").optional(),
  image: Joi.string().optional(),
}).min(1);

// ─── Validation options ───────────────────────────────────────────────────────
// allowUnknown: true  — never throw "is not allowed" for extra fields
// stripUnknown: true  — silently remove them before the value reaches the controller
const OPTIONS = { allowUnknown: true, stripUnknown: true };

const userValidation = {
  // Wrap each schema so validate() is always called with the safe OPTIONS
  register: {
    validate: (data) => registerSchema.validate(data, OPTIONS),
  },
  login: {
    validate: (data) => loginSchema.validate(data, OPTIONS),
  },
  update: {
    validate: (data) => updateSchema.validate(data, OPTIONS),
  },
};

module.exports = { userValidation };
