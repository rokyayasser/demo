/* eslint-disable no-unused-vars */
// pages/Courses.jsx — enroll without login
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  Search,
  BookOpen,
  Clock,
  Star,
  Play,
  Lock,
  X,
  User,
  Mail,
  Phone,
  Loader,
  CreditCard,
} from "lucide-react";
import { CourseContext } from "../../context/CourseContext";
import api from "../../api/axios.config";

// ─── Enrollment modal — collects name/email/phone ─────────────────────────────
const EnrollModal = ({ course, onClose }) => {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const isFree = !course.price || Number(course.price) === 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      toast.error("يرجى إدخال جميع البيانات المطلوبة");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/api/v1/courses/enroll-guest", {
        courseId: course._id,
        customerInfo: form,
      });

      if (!data.success) {
        toast.error(data.message || "حدث خطأ");
        return;
      }

      // Free course — enrolled immediately
      if (data.data?.free) {
        toast.success(`🎉 تم التسجيل! سيصلك رابط الكورس على ${form.email}`);
        onClose();
        return;
      }

      // Paid — redirect to Paymob
      const paymentUrl = data.data?.paymentUrl || data.data?.iframeUrl;
      if (paymentUrl) {
        toast.info("جارٍ تحويلك لصفحة الدفع...");
        sessionStorage.setItem(
          "pending_enrollment",
          JSON.stringify({
            courseId: course._id,
            email: form.email,
            name: form.name,
          }),
        );
        window.location.href = paymentUrl;
        return;
      }

      toast.success("تم استقبال طلبك! سنتواصل معك قريباً");
      onClose();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "حدث خطأ، يرجى المحاولة لاحقاً",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2d1b5a] to-[#1a0f3a] p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-1.5 hover:bg-white/20 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold mb-1">التسجيل في الكورس</h2>
          <p className="text-white/70 text-sm line-clamp-1">
            {course.title_ar || course.title}
          </p>
          <div className="mt-3 inline-block bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
            {isFree
              ? "🎁 مجاني"
              : `💳 ${Number(course.price).toLocaleString()} جنيه`}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4" dir="rtl">
          <p className="text-sm text-gray-500 mb-2">
            {isFree
              ? "أدخل بياناتك وسيصلك رابط الكورس فوراً على بريدك الإلكتروني"
              : "أدخل بياناتك ثم أكمل الدفع — سيصلك رابط الكورس على بريدك بعد الدفع"}
          </p>

          <div className="relative">
            <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              value={form.name}
              onChange={set("name")}
              required
              placeholder="الاسم الكامل *"
              className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl text-sm
                focus:outline-none focus:ring-2 focus:ring-[#9b61db]/40"
            />
          </div>

          <div className="relative">
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              value={form.email}
              onChange={set("email")}
              required
              type="email"
              placeholder="البريد الإلكتروني * (سيصلك الرابط هنا)"
              className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl text-sm
                focus:outline-none focus:ring-2 focus:ring-[#9b61db]/40"
            />
          </div>

          <div className="relative">
            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              value={form.phone}
              onChange={set("phone")}
              required
              placeholder="رقم الهاتف *"
              className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl text-sm
                focus:outline-none focus:ring-2 focus:ring-[#9b61db]/40"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2
              transition-all disabled:opacity-60
              ${
                isFree
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg"
                  : "bg-gradient-to-r from-[#6d28d9] to-[#9b61db] hover:shadow-lg hover:shadow-[#9b61db]/30"
              }`}
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" /> جارٍ المعالجة...
              </>
            ) : isFree ? (
              <>
                <BookOpen className="w-5 h-5" /> سجّل مجاناً
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" /> ادفع وسجّل —{" "}
                {Number(course.price).toLocaleString()} جنيه
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// ─── Courses page ─────────────────────────────────────────────────────────────
const Courses = () => {
  const navigate = useNavigate();
  const { courses, getAllCourses, isLoading } = useContext(CourseContext);
  const [search, setSearch] = useState("");
  const [enrollModal, setEnrollModal] = useState(null); // course to enroll in

  useEffect(() => {
    if (courses.length === 0) getAllCourses();
  }, []);

  const rawCourses = Array.isArray(courses)
    ? courses
    : Array.isArray(courses?.courses)
      ? courses.courses
      : Array.isArray(courses?.data)
        ? courses.data
        : [];

  const filtered = search
    ? rawCourses.filter((c) =>
        (c.title_ar || c.title || "")
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
    : rawCourses;

  return (
    <div className="mt-40 my-12 px-4 sm:px-6 lg:px-10" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="text-xs md:text-sm text-secondary mb-3 flex items-center gap-1">
            <span className="cursor-pointer" onClick={() => navigate("/")}>
              الرئيسية
            </span>
            <span>/</span>
            <span>الكورسات</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold mb-2">
            كورسات د. أحمد الخطيب
          </h1>
          <p className="text-gray-400 text-sm">
            سجّل مباشرة بدون حساب — رابط الكورس يصلك على بريدك
          </p>
        </div>

        {/* Search */}
        <div className="mb-10 max-w-md">
          <div className="relative">
            <Search
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="ابحث عن كورس..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-11 pl-4 py-3 border border-gray-200 rounded-xl
                focus:ring-2 focus:ring-[#9b61db]/40 text-right bg-gray-50/50 outline-none text-sm"
            />
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#9b61db] border-t-transparent" />
          </div>
        )}

        {!isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <BookOpen className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">
                  {search
                    ? "لم يتم العثور على كورسات."
                    : "لا توجد كورسات متاحة حالياً."}
                </p>
              </div>
            ) : (
              filtered.map((course) => {
                const isFree = !course.price || Number(course.price) === 0;
                return (
                  <motion.div
                    key={course._id}
                    whileHover={{ y: -6 }}
                    className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden
                      hover:border-[#9b61db]/40 transition-all shadow-lg"
                  >
                    {/* Thumbnail */}
                    <div
                      className="relative h-48 overflow-hidden cursor-pointer"
                      onClick={() => navigate(`/courses/${course._id}`)}
                    >
                      {course.image ? (
                        <img
                          src={course.image}
                          alt={course.title_ar}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#2d1b5a] to-[#1a0f3a] flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-[#9b61db]" />
                        </div>
                      )}
                      <div
                        className={`absolute top-3 left-3 px-3 py-1 rounded-full text-sm font-bold
                        ${isFree ? "bg-green-500 text-white" : "bg-[#9b61db] text-white"}`}
                      >
                        {isFree ? "مجاني" : `${course.price} جنيه`}
                      </div>
                    </div>

                    <div className="p-5">
                      <h3
                        className="font-bold text-white text-base mb-2 line-clamp-2 cursor-pointer"
                        onClick={() => navigate(`/courses/${course._id}`)}
                      >
                        {course.title_ar || course.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2 mb-4 leading-relaxed">
                        {course.description_ar || course.description}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-gray-400 mb-5">
                        {course.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {course.duration}
                          </span>
                        )}
                        {course.totalLessons > 0 && (
                          <span className="flex items-center gap-1">
                            <Play className="w-3.5 h-3.5" />
                            {course.totalLessons} درس
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                          4.9
                        </span>
                      </div>

                      <button
                        onClick={() => setEnrollModal(course)}
                        className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2
                          ${
                            isFree
                              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg"
                              : "bg-gradient-to-r from-[#8349c7] to-[#9b61db] text-white hover:shadow-lg hover:shadow-[#9b61db]/30"
                          }`}
                      >
                        {isFree ? (
                          <>
                            <BookOpen className="w-4 h-4" /> سجّل مجاناً
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" /> اشترك — {course.price}{" "}
                            جنيه
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Enroll Modal */}
      <AnimatePresence>
        {enrollModal && (
          <EnrollModal
            course={enrollModal}
            onClose={() => setEnrollModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Courses;
