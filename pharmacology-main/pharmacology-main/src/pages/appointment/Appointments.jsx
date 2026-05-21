/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  Video,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

// Components (تأكد من مسارات هذه المكونات لديك)
import AppointmentForm from "../../components/appointment/AppointmentForm";
import TimeSlots from "../../components/appointment/TimeSlots";
import Calendar from "../../components/appointment/Calender";

// ==========================================
// 1. البيانات الوهمية (Mock Data) كبديل للباك إند
// ==========================================
const mockServiceInfo = {
  _id: "s1",
  title: "استشارة أونلاين",
  category: "استشارات طبية",
  fees: 150,
  duration: "45 دقيقة",
  description:
    "من يبحث عن استشارة سريعة وفعالة من المنزل للحصول على توجيهات غذائية أو دوائية.",
  features: [
    "جلسة فيديو مباشرة عبر الإنترنت",
    "تقييم شامل للحالة الصحية",
    "توصيات غذائية مخصصة",
    "خطة عمل واضحة ومحددة",
    "متابعة عبر الرسائل لمدة أسبوع",
  ],
  available: true,
};

const mockBookedSlotsData = {
  "الجمعة، 27 فبراير 2026": ["10:00 ص", "11:30 ص", "03:00 م"],
};

const mockBlockedSlotsData = {
  "الجمعة، 27 فبراير 2026": ["02:00 م"],
};

// ==========================================
// 2. المكون الأساسي
// ==========================================
const Appointments = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const [state, setState] = useState({
    serviceInfo: null,
    selectedDate: "",
    selectedTime: "",
    showForm: false,
    loading: true,
    bookedSlots: {},
    blockedSlots: {},
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    selectedDayIndex: null,
    slotsError: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      setState((prev) => ({ ...prev, loading: true, slotsError: null }));

      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          serviceInfo: mockServiceInfo,
          bookedSlots: mockBookedSlotsData,
          blockedSlots: mockBlockedSlotsData,
          loading: false,
          slotsError: null,
        }));
      }, 500);
    };

    fetchData();
  }, [serviceId]);

  const handleDateSelect = (dateKey) => {
    setState((prev) => ({
      ...prev,
      selectedDate: dateKey,
      selectedTime: "",
    }));
  };

  const handleTimeSelect = async (time) => {
    if (!state.selectedDate) {
      toast.error("يرجى اختيار التاريخ أولاً");
      return;
    }
    setState((prev) => ({
      ...prev,
      selectedTime: time,
    }));
  };

  const handleConfirmBooking = () => {
    if (!state.selectedDate || !state.selectedTime) {
      toast.error("يرجى اختيار التاريخ والوقت أولاً");
      return;
    }

    if (!state.serviceInfo?.available) {
      toast.error("هذه الخدمة غير متاحة للحجز حالياً");
      return;
    }

    setState((prev) => ({
      ...prev,
      showForm: true,
    }));

    setTimeout(() => {
      document.getElementById("appointment-form")?.scrollIntoView({
        behavior: "smooth",
      });
    }, 300);
  };

  const handleMonthChange = (direction) => {
    setState((prev) => {
      let newMonth = prev.currentMonth;
      let newYear = prev.currentYear;

      if (direction === "next") {
        if (newMonth === 11) {
          newMonth = 0;
          newYear += 1;
        } else {
          newMonth += 1;
        }
      } else {
        if (newMonth === 0) {
          newMonth = 11;
          newYear -= 1;
        } else {
          newMonth -= 1;
        }
      }

      return {
        ...prev,
        currentMonth: newMonth,
        currentYear: newYear,
        selectedDayIndex: null,
        selectedTime: "",
      };
    });
  };

  // شاشة التحميل (متوافقة مع الـ Dark Theme)
  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#9b61db] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">جاري تحميل الخدمة...</p>
        </div>
      </div>
    );
  }

  // شاشة الخطأ
  if (!state.serviceInfo) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center bg-white/5 border border-white/10 p-10 rounded-3xl backdrop-blur-md">
          <h3 className="text-2xl font-bold text-white mb-2">
            الخدمة غير متاحة
          </h3>
          <p className="text-gray-400">
            عذراً، لم نتمكن من العثور على هذه الخدمة
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      // الخلفية الداكنة الأساسية مع الإضاءة
      className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-10  font-sans relative overflow-hidden"
      dir="rtl"
    >
      {/* تأثيرات الإضاءة في الخلفية */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-[#2d1b5a]/30 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-[#13072e]/40 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* ======================================================== */}
        {/* ====== 1. Service Details & Summary Layout ====== */}
        {/* ======================================================== */}
        <div className="flex flex-col lg:flex-row gap-8 mb-12 items-start">
          {/* === الجانب الأيمن: تفاصيل الخدمة === */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full lg:w-2/3 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-[0_0_40px_rgba(0,0,0,0.3)] backdrop-blur-xl"
          >
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/10">
              <div className="bg-[#2d1b5a] text-white p-4 rounded-2xl shadow-lg">
                <Video size={32} />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                  تفاصيل الخدمة
                </h2>
                <p className="text-gray-400 text-sm md:text-base">
                  {state.serviceInfo.category}
                </p>
              </div>
            </div>

            {/* قائمة المميزات */}
            <div className="mb-10">
              <h3 className="text-xl font-bold text-gray-200 mb-6">
                ما يشمله:
              </h3>
              <ul className="space-y-4">
                {state.serviceInfo.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-4 text-gray-300 font-medium text-base md:text-lg"
                  >
                    <CheckCircle2 className="text-green-400 w-6 h-6 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* كروت السعر والمدة */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-[#0a051d]/50 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-inner">
                <span className="text-gray-400 text-sm mb-2 font-medium">
                  السعر
                </span>
                <span className="text-[#9b61db] text-4xl font-extrabold">
                  {state.serviceInfo.fees}{" "}
                  <span className="text-2xl">جنية</span>
                </span>
              </div>
              <div className="bg-[#0a051d]/50 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-inner">
                <Clock className="text-[#9b61db] w-8 h-8 mb-2" />
                <span className="text-gray-400 text-sm mb-1 font-medium">
                  مدة الجلسة
                </span>
                <span className="text-white text-2xl font-bold">
                  {state.serviceInfo.duration}
                </span>
              </div>
            </div>

            {/* صندوق الأنسب لـ */}
            <div className="bg-[#2d1b5a]/30 border border-[#2d1b5a] rounded-2xl p-6 shadow-sm">
              <h3 className="text-blue-300 font-bold mb-2 text-lg">
                الأنسب لـ:
              </h3>
              <p className="text-gray-300 leading-relaxed font-medium">
                {state.serviceInfo.description}
              </p>
            </div>
          </motion.div>

          {/* === الجانب الأيسر: ملخص الحجز الثابت (Sticky) === */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full lg:w-1/3 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 shadow-[0_0_40px_rgba(0,0,0,0.3)] backdrop-blur-xl lg:sticky lg:top-32"
          >
            <h2 className="text-2xl font-bold text-white mb-8 text-center">
              ملخص الحجز
            </h2>

            <div className="flex flex-col gap-5 mb-8 border-b border-white/10 pb-8">
              <div className="flex items-center gap-4 text-gray-300">
                <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                  <Video className="w-5 h-5 text-[#9b61db]" />
                </div>
                <span className="font-medium text-lg">
                  {state.serviceInfo.title}
                </span>
              </div>
              <div className="flex items-center gap-4 text-gray-300">
                <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                  <Clock className="w-5 h-5 text-[#9b61db]" />
                </div>
                <span className="font-medium text-lg">
                  {state.serviceInfo.duration}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400 text-base font-medium">السعر</span>
              <span className="font-bold text-white text-lg">
                {state.serviceInfo.fees} جنية
              </span>
            </div>
            <div className="flex justify-between items-center mb-10">
              <span className="text-white text-xl font-bold">المجموع</span>
              <span className="font-extrabold text-[#9b61db] text-3xl">
                {state.serviceInfo.fees} جنية
              </span>
            </div>

            <button
              onClick={() =>
                document
                  .getElementById("calendar-section")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="w-full bg-gradient-to-r from-[#8349c7] to-[#9b61db] text-white py-4 rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(155,97,219,0.3)] hover:shadow-[0_0_30px_rgba(155,97,219,0.5)] active:scale-95 flex justify-center items-center gap-3 border border-white/10"
            >
              <span>التالي</span>
              <ArrowLeft className="w-6 h-6" />
            </button>
          </motion.div>
        </div>

        {/* ======================================================== */}
        {/* ====== 2. Calendar & TimeSlots ====== */}
        {/* ======================================================== */}
        <div id="calendar-section" className="scroll-mt-32">
          {!state.showForm ? (
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 shadow-[0_0_40px_rgba(0,0,0,0.3)] backdrop-blur-xl">
              {/* التقويم */}
              <div className="mt-4">
                {/* ملاحظة: إذا كان مكون Calendar و TimeSlots الخاص بك مصممين بثيم فاتح، 
                   قد تحتاج إلى تمرير prop مثل theme="dark" إليهم أو تعديل ألوانهم من الداخل لاحقاً.
                   الآن هما داخل حاوية زجاجية داكنة ستعطيهم مظهراً أنيقاً.
                */}
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

              {/* الأوقات المتاحة */}
              {state.selectedDate && (
                <div className="mt-10 border-t border-white/10 pt-10">
                  <TimeSlots
                    selectedDate={state.selectedDate}
                    selectedTime={state.selectedTime}
                    bookedSlots={state.bookedSlots[state.selectedDate] || []}
                    blockedSlots={state.blockedSlots[state.selectedDate] || []}
                    onTimeSelect={handleTimeSelect}
                  />
                </div>
              )}

              {/* زر التأكيد */}
              {state.selectedDate && state.selectedTime && (
                <div className="mt-12 text-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleConfirmBooking}
                    className="bg-gradient-to-r from-[#8349c7] to-[#9b61db] text-white text-lg font-bold px-12 py-4 rounded-xl shadow-[0_0_20px_rgba(155,97,219,0.3)] hover:shadow-[0_0_30px_rgba(155,97,219,0.5)] transition-all border border-white/10 flex items-center justify-center gap-3 mx-auto"
                  >
                    تأكيد الحجز والمتابعة <ArrowLeft className="w-5 h-5" />
                  </motion.button>
                </div>
              )}
            </div>
          ) : (
            /* ======================================================== */
            /* =================== 3. Appointment Form ================= */
            /* ======================================================== */
            <div id="appointment-form" className="mt-12 scroll-mt-32">
              <AppointmentForm
                selectedDate={`${state.selectedDate} - ${state.selectedTime}`}
                selectedCategory={state.serviceInfo.category}
                serviceId={state.serviceInfo._id}
                serviceFees={state.serviceInfo.fees}
                serviceInfo={state.serviceInfo}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Appointments;
