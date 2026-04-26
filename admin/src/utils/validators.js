const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
};

export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, error: "البريد الإلكتروني مطلوب" };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, error: "البريد الإلكتروني غير صالح" };
  }

  return { isValid: true, error: null };
};

export const validateRequired = (value, fieldName = "الحقل") => {
  if (isEmpty(value)) {
    return { isValid: false, error: `${fieldName} مطلوب` };
  }
  return { isValid: true, error: null };
};

export const validateMinLength = (value, minLength, fieldName = "الحقل") => {
  if (!value || value.length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} يجب أن يكون ${minLength} أحرف على الأقل`,
    };
  }
  return { isValid: true, error: null };
};

export const validatePositiveNumber = (value, fieldName = "الحقل") => {
  const numValue = Number(value);

  if (isNaN(numValue) || numValue <= 0) {
    return { isValid: false, error: `${fieldName} يجب أن يكون رقماً موجباً` };
  }

  return { isValid: true, error: null };
};

export const validateLoginForm = (formData) => {
  const errors = {};

  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
  }

  if (!formData.password || formData.password.length < 6) {
    errors.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
  }

  if (!formData.role || !["admin", "doctor"].includes(formData.role)) {
    errors.role = "الرجاء اختيار نوع الحساب";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const sanitizeInput = (input) => {
  if (!input || typeof input !== "string") return input;

  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .trim();
};
