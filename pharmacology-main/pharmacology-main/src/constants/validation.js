export const VALIDATION = {
  // Email validation
  EMAIL: {
    regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "يرجى إدخال بريد إلكتروني صحيح",
  },

  // Phone validation
  PHONE: {
    regex: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
    message: "يرجى إدخال رقم هاتف صحيح",
  },

  // Password validation
  PASSWORD: {
    minLength: 6,
    message: "كلمة المرور يجب أن تكون على الأقل 6 أحرف",
  },

  // Name validation
  NAME: {
    minLength: 2,
    maxLength: 50,
    message: "الاسم يجب أن يكون بين 2 و 50 حرف",
  },

  // Medical field validations
  MEDICAL: {
    HEIGHT: {
      min: 50,
      max: 250,
      message: "الطول يجب أن يكون بين 50 و 250 سم",
    },
    WEIGHT: {
      min: 10,
      max: 300,
      message: "الوزن يجب أن يكون بين 10 و 300 كجم",
    },
    AGE: {
      min: 1,
      max: 120,
      message: "العمر يجب أن يكون بين 1 و 120 سنة",
    },
  },

  // Form validation functions
  validateEmail: (email) => {
    if (!email) return "البريد الإلكتروني مطلوب";
    if (!VALIDATION.EMAIL.regex.test(email)) return VALIDATION.EMAIL.message;
    return null;
  },

  validatePassword: (password) => {
    if (!password) return "كلمة المرور مطلوبة";
    if (password.length < VALIDATION.PASSWORD.minLength)
      return VALIDATION.PASSWORD.message;
    return null;
  },

  validatePhone: (phone) => {
    if (!phone) return "رقم الهاتف مطلوب";
    if (!VALIDATION.PHONE.regex.test(phone)) return VALIDATION.PHONE.message;
    return null;
  },

  validateName: (name) => {
    if (!name) return "الاسم مطلوب";
    if (
      name.length < VALIDATION.NAME.minLength ||
      name.length > VALIDATION.NAME.maxLength
    )
      return VALIDATION.NAME.message;
    return null;
  },

  validateHeight: (height) => {
    if (!height) return "الطول مطلوب";
    const heightNum = parseFloat(height);
    if (
      isNaN(heightNum) ||
      heightNum < VALIDATION.MEDICAL.HEIGHT.min ||
      heightNum > VALIDATION.MEDICAL.HEIGHT.max
    )
      return VALIDATION.MEDICAL.HEIGHT.message;
    return null;
  },

  validateWeight: (weight) => {
    if (!weight) return "الوزن مطلوب";
    const weightNum = parseFloat(weight);
    if (
      isNaN(weightNum) ||
      weightNum < VALIDATION.MEDICAL.WEIGHT.min ||
      weightNum > VALIDATION.MEDICAL.WEIGHT.max
    )
      return VALIDATION.MEDICAL.WEIGHT.message;
    return null;
  },

  validateAge: (age) => {
    if (!age) return "العمر مطلوب";
    const ageNum = parseInt(age);
    if (
      isNaN(ageNum) ||
      ageNum < VALIDATION.MEDICAL.AGE.min ||
      ageNum > VALIDATION.MEDICAL.AGE.max
    )
      return VALIDATION.MEDICAL.AGE.message;
    return null;
  },

  // Appointment validation
  validateAppointment: (data) => {
    const errors = {};

    if (!data.selectedDate) errors.selectedDate = "يرجى اختيار التاريخ";
    if (!data.selectedTime) errors.selectedTime = "يرجى اختيار الوقت";
    if (!data.firstName) errors.firstName = "الاسم الأول مطلوب";
    if (!data.email) errors.email = "البريد الإلكتروني مطلوب";
    if (!data.phone) errors.phone = "رقم الهاتف مطلوب";
    if (!data.height) errors.height = "الطول مطلوب";
    if (!data.weight) errors.weight = "الوزن مطلوب";
    if (!data.age) errors.age = "العمر مطلوب";
    if (!data.chronicDiseases)
      errors.chronicDiseases = "الأمراض المزمنة مطلوبة";
    if (!data.currentHealthStatus)
      errors.currentHealthStatus = "الحالة الصحية الحالية مطلوبة";
    if (!data.consultationGoal)
      errors.consultationGoal = "الهدف من الاستشارة مطلوب";

    return errors;
  },
};
