// src/utils/constants.js  — admin/doctor panel

// ─── SERVICE_CATEGORIES ───────────────────────────────────────────────────────
// Must be an ARRAY (not an object) because AddService.jsx calls .map() on it
export const SERVICE_CATEGORIES = [
  { en: "Endocrinology", ar: "الغدد الصماء" },
  { en: "Gastroenterology", ar: "أمراض الجهاز الهضمي" },
  { en: "Nutrition", ar: "التغذية" },
  { en: "ChronicDiseases", ar: "الأمراض المزمنة" },
  { en: "Orthopedics", ar: "المفاصل والعظام" },
  { en: "SpecialConsultation", ar: "استشارات خاصة" },
  { en: "Laboratory", ar: "المعامل" },
  { en: "Cardiology", ar: "القلب والأوعية الدموية" },
  { en: "Dermatology", ar: "الأمراض الجلدية" },
  { en: "Pediatrics", ar: "طب الأطفال" },
];

// ─── Arabic date helpers (used by formatters.js) ──────────────────────────────
export const ARABIC_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

export const ARABIC_DAYS = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

// ─── App config ───────────────────────────────────────────────────────────────
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_BACKEND_URL || "http://localhost:4000",
  TIMEOUT: 30000,
};

// ─── Routes ───────────────────────────────────────────────────────────────────
export const ROUTES = {
  HOME: "/",
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    APPOINTMENTS: "/admin/appointments",
    ADD_SERVICE: "/admin/add-service",
    SERVICES: "/admin/services-list",
    EDIT_SERVICE: "/admin/edit-service/:serviceId",
    BLOCK_SLOTS: "/admin/block-slots",
    COURSES: "/admin/courses",
    PRODUCTS: "/admin/products",
    USERS: "/admin/users",
  },
  DOCTOR: {
    CALENDAR: "/doctor/calendar",
    TODAY: "/doctor/today",
    APPOINTMENTS: "/doctor/appointments",
    STATS: "/doctor/stats",
  },
};

// ─── Appointment statuses ─────────────────────────────────────────────────────
export const APPOINTMENT_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show",
  BLOCKED: "blocked",
};

export const APPOINTMENT_STATUS_AR = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  completed: "مكتمل",
  cancelled: "ملغي",
  no_show: "لم يحضر",
  blocked: "محجور",
};

export const APPOINTMENT_STATUS_COLORS = {
  pending: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    border: "border-yellow-200",
  },
  confirmed: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-200",
  },
  completed: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-200",
  },
  cancelled: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-200",
  },
  no_show: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-200",
  },
  blocked: {
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
  },
};

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "تم تسجيل الدخول بنجاح",
  LOGOUT_SUCCESS: "تم تسجيل الخروج بنجاح",
  SAVE_SUCCESS: "تم الحفظ بنجاح",
  UPDATE_SUCCESS: "تم التحديث بنجاح",
  DELETE_SUCCESS: "تم الحذف بنجاح",
  CREATE_SUCCESS: "تم الإنشاء بنجاح",
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: "خطأ في الاتصال بالخادم",
  UNAUTHORIZED: "غير مصرح لك بالوصول",
  INVALID_CREDENTIALS: "بيانات الدخول غير صحيحة",
  SESSION_EXPIRED: "انتهت صلاحية الجلسة",
  REQUIRED_FIELD: "هذا الحقل مطلوب",
  INVALID_EMAIL: "البريد الإلكتروني غير صالح",
  GENERIC_ERROR: "حدث خطأ ما",
};
