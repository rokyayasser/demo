// src/utils/formatters.js  — admin/doctor panel

import { ARABIC_MONTHS, ARABIC_DAYS } from "./constants";

// ─── Date formatting ──────────────────────────────────────────────────────────

/**
 * "2025-04-10"  →  "الخميس، 10 أبريل 2025"
 * Also accepts a full ISO string or a Date object.
 */
export const isoToArabicDate = (isoDate) => {
  if (!isoDate) return "";
  try {
    const date = new Date(isoDate);
    if (isNaN(date)) return String(isoDate);
    const dayName = ARABIC_DAYS[date.getDay()];
    const day = date.getDate();
    const monthName = ARABIC_MONTHS[date.getMonth()];
    const year = date.getFullYear();
    return `${dayName}، ${day} ${monthName} ${year}`;
  } catch {
    return String(isoDate);
  }
};

/**
 * Alias used in DoctorAppointments / DoctorCalendar.
 * Accepts "YYYY-MM-DD", ISO string, or Date.
 */
export const formatArabicDate = isoToArabicDate;

// ─── Time formatting ──────────────────────────────────────────────────────────

/**
 * Accepts:
 *   "١١:٣٠ ص"   → returned as-is (already Arabic)
 *   "11:30"      → "١١:٣٠ ص"
 *   "11:30 AM"   → "١١:٣٠ ص"
 *   Date object  → formatted
 */
export const formatTime = (time) => {
  if (!time) return "";
  try {
    const t = String(time).trim();

    // ── Already Arabic (contains ص or م) — return as-is ───────────────────
    if (t.includes("ص") || t.includes("م")) return t;

    // ── ISO timestamp "2026-04-25T10:30:00.000Z" ──────────────────────────
    if (t.includes("T")) {
      const d = new Date(t);
      if (!isNaN(d))
        return d
          .toLocaleTimeString("ar-EG", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
          .replace("AM", "ص")
          .replace("PM", "م");
    }

    // ── "HH:MM" or "HH:MM AM/PM" ─────────────────────────────────────────
    const clean = t.replace(/\s*(AM|PM|am|pm)/i, "").trim();
    const [h, m] = clean.split(":").map(Number);
    if (isNaN(h)) return t; // unrecognized — return raw
    const isPM = /pm/i.test(t);
    const hours = isPM && h !== 12 ? h + 12 : !isPM && h === 12 ? 0 : h;
    const date = new Date();
    date.setHours(hours, m || 0, 0, 0);

    return date
      .toLocaleTimeString("ar-EG", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace("AM", "ص")
      .replace("PM", "م");
  } catch {
    return String(time);
  }
};

// ─── Currency ─────────────────────────────────────────────────────────────────

export const formatCurrency = (amount) => {
  if (amount == null) return "0 جنيه";
  try {
    return `${Number(amount).toLocaleString("ar-EG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })} جنيه`;
  } catch {
    return `${amount} جنيه`;
  }
};

// ─── Text helpers ─────────────────────────────────────────────────────────────

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text || "";
  return text.substring(0, maxLength).trim() + "...";
};

// ─── Appointment status ───────────────────────────────────────────────────────

const STATUS_MAP = {
  pending: {
    text: "قيد الانتظار",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  confirmed: {
    text: "مؤكد",
    color: "bg-green-100  text-green-800  border-green-200",
  },
  completed: {
    text: "مكتمل",
    color: "bg-blue-100   text-blue-800   border-blue-200",
  },
  cancelled: {
    text: "ملغي",
    color: "bg-red-100    text-red-800    border-red-200",
  },
  no_show: {
    text: "لم يحضر",
    color: "bg-gray-100   text-gray-700   border-gray-200",
  },
  blocked: {
    text: "محجور",
    color: "bg-slate-100  text-slate-700  border-slate-200",
  },
};

/**
 * Returns the Tailwind class string for a status badge.
 * Used in DoctorToday, DoctorAppointments, DoctorCalendar, AllAppointments.
 *
 * @param {string} status
 * @returns {string}  e.g. "bg-green-100 text-green-800 border-green-200"
 */
export const getStatusColor = (status) =>
  STATUS_MAP[status]?.color ?? "bg-gray-100 text-gray-700 border-gray-200";

/**
 * Returns the Arabic label for a status.
 *
 * @param {string} status
 * @returns {string}  e.g. "مؤكد"
 */
export const getStatusText = (status) =>
  STATUS_MAP[status]?.text ?? status ?? "—";

/**
 * Returns both text + color together (backwards-compat with old code
 * that used formatAppointmentStatus).
 */
export const formatAppointmentStatus = (status) =>
  STATUS_MAP[status] ?? {
    text: status,
    color: "bg-gray-100 text-gray-700 border-gray-200",
  };
