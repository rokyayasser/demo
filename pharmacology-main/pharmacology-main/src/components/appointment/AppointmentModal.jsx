/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  X,
  Video,
  CheckCircle2,
  Clock,
  Calendar as CalendarIcon,
  Check,
  Mail,
  ArrowRight,
  ArrowLeft,
  Upload,
  Paperclip,
  Trash2,
} from "lucide-react";
import TimeSlots from "./TimeSlots";
import Calendar from "./Calender";
import { appointmentApi } from "../../api/appointment.api";
import { AppContext, extractArabicError } from "../../context/AppContext";
import DualPrice from "../common/DualPrice";
import { getUsdToEgpRate, toUsd } from "../../utils/currency.service";

const AppointmentModal = ({ isOpen, onClose, serviceInfo }) => {
  const { userData } = useContext(AppContext);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [usdRate, setUsdRate] = useState(null);

  // Fetch live USD/EGP exchange rate for price display and USD payment
  useEffect(() => {
    getUsdToEgpRate()
      .then(setUsdRate)
      .catch(() => setUsdRate(50));
  }, []);

  const [state, setState] = useState({
    selectedDate: "",
    selectedTime: "",
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    bookedSlots: {},
    blockedSlots: {},
    formData: {
      name: "",
      email: "",
      phone: "",
      goals: "",
      currentMedications: "", // text field for medications
    },
    paymentCurrency: "EGP", // "EGP" | "USD"
    testsFiles: [], // array of File objects (tests)
    medicationsFile: null, // single File (medications PDF/image)
  });

  // Pre-fill from user profile
  useEffect(() => {
    if (userData) {
      setState((p) => ({
        ...p,
        formData: {
          ...p.formData,
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
        },
      }));
    }
  }, [userData]);

  // Reset + fetch slots when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setState((p) => ({ ...p, selectedDate: "", selectedTime: "" }));
      document.body.style.overflow = "hidden";
      fetchAllBookedSlots();
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Re-fetch when month changes
  useEffect(() => {
    if (isOpen) fetchAllBookedSlots();
  }, [state.currentMonth, state.currentYear, isOpen]);

  const fetchAllBookedSlots = async () => {
    setSlotsLoading(true);
    try {
      const res = await appointmentApi.getBookedSlots();
      if (res.success) {
        setState((p) => ({
          ...p,
          bookedSlots: res.data?.bookedSlots || res.bookedSlots || {},
          blockedSlots: res.data?.blockedSlots || res.blockedSlots || {},
        }));
      }
    } catch (err) {
      console.error("Failed to fetch booked slots:", err);
    } finally {
      setSlotsLoading(false);
    }
  };

  if (!isOpen || !serviceInfo) return null;

  const handleDateSelect = (dateKey) =>
    setState((p) => ({ ...p, selectedDate: dateKey, selectedTime: "" }));

  const handleTimeSelect = (time) => {
    if (!state.selectedDate) {
      toast.error("يرجى اختيار التاريخ أولاً");
      return;
    }
    setState((p) => ({ ...p, selectedTime: time }));
  };

  const handleMonthChange = (monthOrDirection, year) => {
    setState((p) => {
      let m = p.currentMonth,
        y = p.currentYear;

      // New Calender.jsx passes (monthNumber, yearNumber) directly
      if (typeof monthOrDirection === "number" && year !== undefined) {
        m = monthOrDirection;
        y = year;
      }
      // Old/legacy: direction string "next" | "prev"
      else if (monthOrDirection === "next") {
        if (m === 11) {
          m = 0;
          y++;
        } else m++;
      } else {
        if (m === 0) {
          m = 11;
          y--;
        } else m--;
      }

      return { ...p, currentMonth: m, currentYear: y, selectedTime: "" };
    });
  };

  const handleNext = async () => {
    if (step === 2) {
      if (!state.selectedDate) {
        toast.error("الرجاء اختيار التاريخ");
        return;
      }
      if (!state.selectedTime) {
        toast.error("الرجاء اختيار الوقت");
        return;
      }
      try {
        const result = await appointmentApi.checkSlotAvailability(
          state.selectedDate,
          state.selectedTime,
        );
        if (!result.isAvailable) {
          toast.error(
            result.message || "هذا الوقت تم حجزه مؤخراً، يرجى اختيار وقت آخر",
          );
          await fetchAllBookedSlots();
          return;
        }
      } catch {
        toast.error("حدث خطأ في التحقق من الموعد");
        return;
      }
    }

    if (step === 3) {
      const { name, email, phone } = state.formData;
      if (!name.trim()) {
        toast.error("الاسم الكامل مطلوب");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast.error("يرجى إدخال بريد إلكتروني صالح");
        return;
      }
      if (!phone.trim()) {
        toast.error("رقم الجوال مطلوب");
        return;
      }
    }

    setStep((p) => p + 1);
  };

  const handleBack = () => setStep((p) => p - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const fullName = state.formData.name.trim();
      const nameParts = fullName.split(/\s+/);

      // ── FIX: lastName must never be empty ──────────────────────────────
      // If the user has only one name, use it for both first and last.
      // The backend validation requires lastName to be non-empty.
      const firstName = nameParts[0] || fullName;
      const lastName =
        nameParts.length > 1 ? nameParts.slice(1).join(" ") : nameParts[0]; // fall back to the same name

      const formData = new FormData();
      formData.append("serviceId", serviceInfo._id || serviceInfo.id || "");
      // Convert ISO "2026-04-25" → Arabic "الجمعة، 25 أبريل 2026"
      const ARABIC_MONTHS_FULL = [
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
      const ARABIC_DAYS_FULL = [
        "الأحد",
        "الاثنين",
        "الثلاثاء",
        "الأربعاء",
        "الخميس",
        "الجمعة",
        "السبت",
      ];
      const dateObj = new Date(state.selectedDate + "T12:00:00");
      const arabicDate = `${ARABIC_DAYS_FULL[dateObj.getDay()]}، ${dateObj.getDate()} ${ARABIC_MONTHS_FULL[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
      formData.append("date", arabicDate);
      formData.append("time", state.selectedTime);
      formData.append("category", serviceInfo.category || "استشارة");
      // Amount in chosen currency
      const paymentCurrency = state.paymentCurrency || "EGP";
      const amountInCurrency =
        paymentCurrency === "USD" && usdRate
          ? parseFloat(toUsd(serviceInfo.fees, usdRate).replace("$", ""))
          : serviceInfo.fees;
      formData.append("amount", String(amountInCurrency || 0));
      formData.append("currency", paymentCurrency);
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("email", state.formData.email);
      formData.append("phone", state.formData.phone);
      formData.append("message", state.formData.goals || "");
      // Required medical fields — set sensible defaults when coming from the modal
      formData.append("height", "0");
      formData.append("weight", "0");
      formData.append("age", "0");
      formData.append("chronicDiseases", "لا يوجد");
      formData.append(
        "currentHealthStatus",
        state.formData.goals || "استشارة عامة",
      );
      formData.append("consultationGoal", state.formData.goals || "استشارة");
      formData.append(
        "currentMedications",
        state.formData.currentMedications || "",
      );

      // Attach uploaded files
      if (state.medicationsFile) {
        formData.append("medicationsFile", state.medicationsFile);
      }
      if (state.testsFiles?.length) {
        state.testsFiles.forEach((f) => formData.append("testsFile", f));
      }

      const res = await appointmentApi.bookAppointment(formData);

      if (res.success) {
        // If Paymob returned a payment URL, redirect to payment page
        const paymentUrl = res.data?.paymentUrl || res.data?.iframeUrl;
        if (paymentUrl) {
          toast.info("جارٍ تحويلك لصفحة الدفع...");
          sessionStorage.setItem(
            "pending_appointment",
            JSON.stringify({
              appointmentId: res.data?.appointmentId,
              email: state.formData.email,
              name: state.formData.name,
            }),
          );
          window.location.href = paymentUrl;
          return;
        }
        setStep(5);
      } else {
        // Show the specific Arabic error from the server
        toast.error(res.message || "حدث خطأ أثناء الحجز");
      }
    } catch (err) {
      toast.error(extractArabicError(err, "حدث خطأ، يرجى المحاولة مرة أخرى"));
    } finally {
      setLoading(false);
    }
  };

  const stepsList = ["تفاصيل الخدمة", "اختر الموعد", "معلوماتك", "التأكيد"];

  const renderStepper = () => (
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto mb-8 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
      {stepsList.map((s, index) => {
        const stepNum = index + 1;
        const isActive = step === stepNum;
        const isCompleted = step > stepNum;
        return (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center gap-2 relative z-10">
              <div
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${isCompleted ? "bg-[#2d1b5a] text-white" : isActive ? "bg-[#2d1b5a] text-white ring-4 ring-[#2d1b5a]/20" : "bg-gray-100 text-gray-400 border border-gray-200"}`}
              >
                {isCompleted ? <Check size={16} /> : stepNum}
              </div>
              <span
                className={`text-xs md:text-sm font-medium hidden sm:block ${isActive || isCompleted ? "text-[#2d1b5a]" : "text-gray-400"}`}
              >
                {s}
              </span>
            </div>
            {index < stepsList.length - 1 && (
              <div
                className={`flex-1 h-[2px] rounded-full mx-2 md:mx-4 ${isCompleted ? "bg-[#2d1b5a]" : "bg-gray-200"}`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
        dir="rtl"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={step === 5 ? onClose : undefined}
          className="absolute inset-0 bg-[#2d1b5a]/40 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative w-full max-w-5xl max-h-[85vh] overflow-y-auto bg-[#f8f9fa] rounded-3xl shadow-2xl flex flex-col"
        >
          {step < 5 && (
            <>
              {/* Header */}
              <div className="bg-white p-5 md:p-6 rounded-t-3xl flex justify-between items-center shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className="bg-[#2d1b5a] text-white p-3 rounded-xl shadow-md">
                    <Video size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                      {serviceInfo.title}
                    </h2>
                    <p className="text-gray-500 text-sm hidden sm:block">
                      {serviceInfo.category}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-4 md:p-8 flex-grow">
                {renderStepper()}
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Step content */}
                  <div className="w-full lg:w-2/3">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* STEP 1 — service details */}
                        {step === 1 && (
                          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">
                              تفاصيل الخدمة
                            </h3>
                            <div className="mb-8">
                              <p className="font-bold text-gray-800 mb-4">
                                ما يشمله:
                              </p>
                              <ul className="space-y-3">
                                {(serviceInfo.features || []).map((feat, i) => (
                                  <li
                                    key={i}
                                    className="flex items-center gap-3 text-gray-600"
                                  >
                                    <CheckCircle2
                                      size={20}
                                      className="text-green-500"
                                    />
                                    <span>{feat}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                              <div className="bg-[#fdf8ef] p-6 rounded-2xl text-center border border-[#f5e6b3]">
                                <p className="text-gray-500 text-sm mb-1">
                                  السعر
                                </p>
                                <DualPrice egp={serviceInfo.fees} size="lg" />
                              </div>
                              <div className="bg-[#eef2fc] p-6 rounded-2xl text-center border border-[#dbe4ff] flex flex-col items-center justify-center">
                                <Clock
                                  size={24}
                                  className="text-[#2d1b5a] mb-2"
                                />
                                <p className="text-gray-500 text-sm mb-1">
                                  مدة الجلسة
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                  {serviceInfo.duration}
                                </p>
                              </div>
                            </div>
                            <div className="bg-[#eafaf1] p-6 rounded-2xl border border-[#bbf7d0]">
                              <p className="font-bold text-gray-800 mb-1 text-center">
                                الأنسب لك
                              </p>
                              <p className="text-gray-600 text-center text-sm">
                                {serviceInfo.description}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* STEP 2 — calendar + slots */}
                        {step === 2 && (
                          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">
                              اختر الموعد والوقت
                            </h3>
                            {slotsLoading && (
                              <div className="text-center py-4 text-gray-500 text-sm">
                                جاري تحميل المواعيد المتاحة…
                              </div>
                            )}
                            <div className="mb-8">
                              <Calendar
                                currentMonth={state.currentMonth}
                                currentYear={state.currentYear}
                                selectedDate={state.selectedDate}
                                bookedSlots={state.bookedSlots}
                                blockedSlots={state.blockedSlots}
                                onMonthChange={handleMonthChange}
                                onDateSelect={handleDateSelect}
                              />
                            </div>
                            {state.selectedDate && (
                              <div className="border-t border-gray-100 pt-6">
                                <TimeSlots
                                  selectedDate={state.selectedDate}
                                  selectedTime={state.selectedTime}
                                  bookedSlots={
                                    state.bookedSlots[state.selectedDate] || []
                                  }
                                  blockedSlots={
                                    state.blockedSlots[state.selectedDate] || []
                                  }
                                  onTimeSelect={handleTimeSelect}
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* STEP 3 — personal info */}
                        {step === 3 && (
                          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">
                              معلوماتك الشخصية
                            </h3>
                            <div className="space-y-5">
                              {[
                                {
                                  label: "الاسم الكامل",
                                  key: "name",
                                  type: "text",
                                  placeholder: "أدخل اسمك الكامل",
                                  required: true,
                                },
                                {
                                  label: "البريد الإلكتروني",
                                  key: "email",
                                  type: "email",
                                  placeholder: "example@email.com",
                                  required: true,
                                },
                                {
                                  label: "رقم الجوال",
                                  key: "phone",
                                  type: "tel",
                                  placeholder: "+20 1XX XXX XXXX",
                                  required: true,
                                },
                              ].map((f) => (
                                <div key={f.key}>
                                  <label className="block text-sm font-bold text-gray-700 mb-2">
                                    {f.label}{" "}
                                    {f.required && (
                                      <span className="text-red-500">*</span>
                                    )}
                                  </label>
                                  <input
                                    type={f.type}
                                    placeholder={f.placeholder}
                                    value={state.formData[f.key]}
                                    onChange={(e) =>
                                      setState((p) => ({
                                        ...p,
                                        formData: {
                                          ...p.formData,
                                          [f.key]: e.target.value,
                                        },
                                      }))
                                    }
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2d1b5a]/50 outline-none"
                                  />
                                </div>
                              ))}
                              <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                  هدفك الصحي (اختياري)
                                </label>
                                <textarea
                                  rows="3"
                                  placeholder="أخبرنا عن أهدافك الصحية…"
                                  value={state.formData.goals}
                                  onChange={(e) =>
                                    setState((p) => ({
                                      ...p,
                                      formData: {
                                        ...p.formData,
                                        goals: e.target.value,
                                      },
                                    }))
                                  }
                                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2d1b5a]/50 outline-none resize-none"
                                />
                              </div>
                              {/* ── Medications text ── */}
                              <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                  الأدوية الحالية (اختياري)
                                </label>
                                <textarea
                                  rows="3"
                                  placeholder="اكتب أسماء الأدوية التي تتناولها حالياً…"
                                  value={state.formData.currentMedications}
                                  onChange={(e) =>
                                    setState((p) => ({
                                      ...p,
                                      formData: {
                                        ...p.formData,
                                        currentMedications: e.target.value,
                                      },
                                    }))
                                  }
                                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2d1b5a]/50 outline-none resize-none"
                                />
                              </div>

                              {/* ── Upload medications file ── */}
                              <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                  رفع وصفة الأدوية (PDF أو صورة — اختياري)
                                </label>
                                <label className="flex items-center gap-3 p-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#2d1b5a]/40 transition">
                                  <Upload className="w-5 h-5 text-gray-400 shrink-0" />
                                  <span className="text-sm text-gray-500 flex-1 truncate">
                                    {state.medicationsFile
                                      ? state.medicationsFile.name
                                      : "اضغط لاختيار ملف"}
                                  </span>
                                  {state.medicationsFile && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setState((p) => ({
                                          ...p,
                                          medicationsFile: null,
                                        }));
                                      }}
                                      className="text-red-400 hover:text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                  <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    className="hidden"
                                    onChange={(e) => {
                                      const f = e.target.files?.[0];
                                      if (f)
                                        setState((p) => ({
                                          ...p,
                                          medicationsFile: f,
                                        }));
                                    }}
                                  />
                                </label>
                              </div>

                              {/* ── Upload medical tests ── */}
                              <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                  رفع التحاليل الطبية (صور أو PDF — اختياري،
                                  يمكن رفع أكثر من ملف)
                                </label>
                                <label className="flex items-center gap-3 p-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#2d1b5a]/40 transition">
                                  <Paperclip className="w-5 h-5 text-gray-400 shrink-0" />
                                  <span className="text-sm text-gray-500">
                                    {state.testsFiles?.length
                                      ? `${state.testsFiles.length} ملف مختار`
                                      : "اضغط لاختيار التحاليل"}
                                  </span>
                                  <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => {
                                      const files = Array.from(
                                        e.target.files || [],
                                      );
                                      setState((p) => ({
                                        ...p,
                                        testsFiles: [
                                          ...(p.testsFiles || []),
                                          ...files,
                                        ],
                                      }));
                                    }}
                                  />
                                </label>
                                {state.testsFiles?.length > 0 && (
                                  <div className="mt-2 space-y-1">
                                    {state.testsFiles.map((f, i) => (
                                      <div
                                        key={i}
                                        className="flex items-center gap-2 text-xs text-gray-600 bg-white border border-gray-100 rounded-lg px-3 py-2"
                                      >
                                        <Paperclip className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                        <span className="flex-1 truncate">
                                          {f.name}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setState((p) => ({
                                              ...p,
                                              testsFiles: p.testsFiles.filter(
                                                (_, idx) => idx !== i,
                                              ),
                                            }))
                                          }
                                          className="text-red-400 hover:text-red-600"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="bg-[#fffbeb] border border-[#fde68a] p-4 rounded-xl flex items-center gap-3">
                                <CheckCircle2
                                  className="text-[#f59e0b] shrink-0"
                                  size={20}
                                />
                                <p className="text-sm text-gray-700">
                                  سيتم إرسال تأكيد الحجز ورابط الجلسة إلى بريدك
                                  الإلكتروني.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* STEP 4 — confirmation */}
                        {step === 4 && (
                          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
                            <div className="w-20 h-20 bg-[#2d1b5a] rounded-3xl mx-auto flex items-center justify-center text-white mb-4 shadow-lg rotate-3">
                              <Check size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                              تأكيد الحجز
                            </h3>
                            <p className="text-gray-500 mb-8">
                              راجع تفاصيل حجزك قبل التأكيد
                            </p>
                            <div className="bg-[#f8f9fa] rounded-2xl p-6 text-right mb-4 border border-gray-100 flex items-center justify-between">
                              <div>
                                <p className="font-bold text-gray-900 text-lg mb-1">
                                  {serviceInfo.title}
                                </p>
                                <p className="text-gray-500 text-sm">
                                  {serviceInfo.duration} —{" "}
                                  {serviceInfo.category}
                                </p>
                              </div>
                              <div className="bg-[#2d1b5a] text-white p-3 rounded-xl">
                                <Video size={24} />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                              <div className="bg-[#fef2f2] rounded-2xl p-5 text-right border border-[#fee2e2]">
                                <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                                  <Clock size={16} />
                                  الوقت
                                </p>
                                <p className="font-bold text-gray-900 text-lg">
                                  {state.selectedTime || "—"}
                                </p>
                              </div>
                              <div className="bg-[#ecfdf5] rounded-2xl p-5 text-right border border-[#d1fae5]">
                                <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                                  <CalendarIcon size={16} />
                                  التاريخ
                                </p>
                                <p className="font-bold text-gray-900">
                                  {state.selectedDate || "—"}
                                </p>
                              </div>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-6 text-right border border-gray-100 mb-6">
                              <div className="grid grid-cols-2 gap-y-4 text-sm">
                                <div>
                                  <p className="text-gray-500">الاسم</p>
                                  <p className="font-bold">
                                    {state.formData.name || "—"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">رقم الجوال</p>
                                  <p className="font-bold" dir="ltr">
                                    {state.formData.phone || "—"}
                                  </p>
                                </div>
                                <div className="col-span-2">
                                  <p className="text-gray-500">
                                    البريد الإلكتروني
                                  </p>
                                  <p className="font-bold">
                                    {state.formData.email || "—"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Sidebar summary */}
                  <div className="w-full lg:w-1/3">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 lg:sticky lg:top-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">
                        ملخص الحجز
                      </h3>
                      <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-3 text-gray-600">
                          <Video size={18} className="text-gray-400" />
                          <span className="text-sm font-medium">
                            {serviceInfo.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <Clock size={18} className="text-gray-400" />
                          <span className="text-sm font-medium">
                            {serviceInfo.duration}
                          </span>
                        </div>
                        {state.selectedDate && (
                          <div className="flex items-center gap-3 text-gray-600">
                            <CalendarIcon
                              size={18}
                              className="text-[#2d1b5a]"
                            />
                            <span className="text-sm font-bold text-[#2d1b5a]">
                              {state.selectedDate}
                            </span>
                          </div>
                        )}
                        {state.selectedTime && (
                          <div className="flex items-center gap-3 text-gray-600">
                            <Clock size={18} className="text-[#2d1b5a]" />
                            <span className="text-sm font-bold text-[#2d1b5a]">
                              {state.selectedTime}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="border-t border-gray-100 pt-6 mb-8">
                        <div className="flex justify-between items-center text-lg">
                          <span className="font-bold text-gray-900">
                            المجموع
                          </span>
                          <DualPrice egp={serviceInfo.fees} size="md" />
                        </div>
                      </div>
                      <div className="flex gap-3">
                        {step > 1 && (
                          <button
                            onClick={handleBack}
                            className="w-1/4 py-4 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
                          >
                            <ArrowRight size={20} />
                          </button>
                        )}
                        <div className="flex-1 flex flex-col gap-2">
                          {/* Price display on final step */}
                          {step === 4 && Number(serviceInfo.fees) > 0 && (
                            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-center">
                              <p className="text-xs text-gray-400 mb-1">
                                المبلغ المطلوب
                              </p>
                              <p className="font-extrabold text-[#2d1b5a] text-xl">
                                {Number(serviceInfo.fees).toLocaleString(
                                  "ar-EG",
                                )}{" "}
                                جنيه
                              </p>
                              {usdRate && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                  ≈ {toUsd(serviceInfo.fees, usdRate)} (للمرجعية
                                  فقط)
                                </p>
                              )}
                            </div>
                          )}

                          <button
                            onClick={step === 4 ? handleSubmit : handleNext}
                            disabled={loading}
                            className="w-full py-4 rounded-xl font-bold text-white bg-[#2d1b5a] hover:bg-[#3f267a] shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                          >
                            {loading ? (
                              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                            ) : step === 4 ? (
                              "تأكيد الحجز والدفع"
                            ) : (
                              <>
                                <span>التالي</span>
                                <ArrowLeft size={20} />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* STEP 5 — success */}
          {step === 5 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-4 md:p-8 text-center relative"
            >
              <div className="w-24 h-24 bg-green-500 rounded-full mx-auto flex items-center justify-center text-white mb-6 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                <Check size={50} strokeWidth={3} />
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
                تم تأكيد الحجز بنجاح!
              </h2>
              <p className="text-gray-500 text-lg mb-10">
                شكراً لك {state.formData.name} 🎉
              </p>
              <div className="bg-[#f8f9fa] rounded-2xl p-6 border border-gray-100 max-w-md mx-auto mb-6 text-right">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">موعد الجلسة</p>
                    <p className="font-bold text-gray-900">
                      {state.selectedDate}
                    </p>
                  </div>
                  <CalendarIcon className="text-[#2d1b5a]" size={24} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">الوقت</p>
                    <p className="font-bold text-[#2d1b5a]">
                      {state.selectedTime}
                    </p>
                  </div>
                  <Clock className="text-[#2d1b5a]" size={24} />
                </div>
              </div>
              <div className="bg-[#fff9e6] rounded-2xl p-6 border border-[#fde68a] max-w-md mx-auto mb-10 flex items-start gap-4 text-right">
                <div className="p-3 bg-[#f59e0b] text-white rounded-xl shrink-0">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="font-bold text-gray-800 mb-1">
                    تم إرسال التأكيد إلى
                  </p>
                  <p className="font-bold text-gray-900 mb-2" dir="ltr">
                    {state.formData.email}
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    ستصلك رسالة تأكيد تحتوي على رابط الجلسة وجميع التفاصيل.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full max-w-md mx-auto py-4 rounded-xl font-bold text-white bg-[#2d1b5a] hover:bg-[#3f267a] shadow-xl transition-all block"
              >
                العودة للصفحة الرئيسية
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AppointmentModal;
