const Joi = require("joi");

const serviceValidation = {
  create: Joi.object({
    title: Joi.string().min(2).max(200).required().messages({
      "string.empty": "Title is required",
      "string.min": "Title must be at least 2 characters",
      "string.max": "Title cannot exceed 200 characters",
    }),
    title_ar: Joi.string().min(2).max(200).required().messages({
      "string.empty": "Arabic title is required",
      "string.min": "Arabic title must be at least 2 characters",
      "string.max": "Arabic title cannot exceed 200 characters",
    }),
    category: Joi.string().required().messages({
      "string.empty": "Category is required",
    }),
    category_ar: Joi.string().required().messages({
      "string.empty": "Arabic category is required",
    }),
    description: Joi.string().required().messages({
      "string.empty": "Description is required",
    }),
    features: Joi.alternatives()
      .try(Joi.string(), Joi.array().items(Joi.string()).min(1))
      .required()
      .messages({
        "any.required": "Features are required",
        "array.min": "At least one feature is required",
      }),
    fees: Joi.number().min(0).required().messages({
      "number.base": "Fees must be a number",
      "number.min": "Fees cannot be negative",
      "any.required": "Fees are required",
    }),
    duration: Joi.string().default("30 minutes"),
  }),

  update: Joi.object({
    title: Joi.string().min(2).max(200).messages({
      "string.min": "Title must be at least 2 characters",
      "string.max": "Title cannot exceed 200 characters",
    }),
    title_ar: Joi.string().min(2).max(200).messages({
      "string.min": "Arabic title must be at least 2 characters",
      "string.max": "Arabic title cannot exceed 200 characters",
    }),
    category: Joi.string(),
    category_ar: Joi.string(),
    description: Joi.string(),
    features: Joi.alternatives()
      .try(Joi.string(), Joi.array().items(Joi.string()).min(1))
      .messages({
        "array.min": "At least one feature is required",
      }),
    fees: Joi.number().min(0).messages({
      "number.base": "Fees must be a number",
      "number.min": "Fees cannot be negative",
    }),
    duration: Joi.string(),
    available: Joi.boolean(),
  }),
};

module.exports = { serviceValidation };
