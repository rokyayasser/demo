/* eslint-disable no-unused-vars */
// pages/CourseDetails.jsx  (user side)
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  Clock,
  BookOpen,
  Star,
  Play,
  CheckCircle,
  Lock,
  Award,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react";
import { CourseContext } from "../../context/CourseContext";
import { AppContext } from "../../context/AppContext";
import api from "../../api/axios.config";

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { getCourseById } = useContext(CourseContext);
  const { token, userData } = useContext(AppContext);

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // ── Load course + check enrollment ─────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getCourseById(id);
        if (data) setCourse(data);
        else {
          toast.error("الكورس غير موجود");
          navigate("/courses");
        }
      } catch {
        toast.error("فشل تحميل الكورس");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (token) checkEnrolled();
  }, [token, id]);

  // Re-check enrollment on every mount — catches return-from-payment case
  useEffect(() => {
    if (token) {
      // Small delay allows confirm-payment to finish before we query
      const t = setTimeout(() => checkEnrolled(), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const checkEnrolled = async () => {
    try {
      const { data } = await api.get("/api/v1/courses/user/enrolled");
      if (data.success) {
        // Normalize to array regardless of response shape
        const list = Array.isArray(data.data?.courses)
          ? data.data.courses
          : Array.isArray(data.data)
            ? data.data
            : [];
        // Guard: use optional chaining so .some() never fires on undefined
        const enrolled =
          list?.some?.((c) => (c._id || c.courseId) === id) ?? false;
        setIsEnrolled(enrolled);
      }
    } catch {
      /* silent */
    }
  };

  // ── Enroll / go to player ───────────────────────────────────────────────────
  const handleEnroll = async () => {
    if (!token) {
      toast.error("يجب تسجيل الدخول أولاً");
      navigate("/login");
      return;
    }

    if (isEnrolled) {
      navigate(`/learn/${id}`);
      return;
    }

    setEnrolling(true);
    try {
      const { data } = await api.post("/api/v1/courses/enroll", {
        courseId: id,
      });

      if (!data.success) {
        toast.error(data.message || "حدث خطأ");
        return;
      }

      if (data.data?.alreadyEnrolled || data.data?.free) {
        toast.success("🎉 تم التسجيل! تحقق من بريدك الإلكتروني");
        setIsEnrolled(true);
        setTimeout(() => navigate(`/learn/${id}`), 1500);
        return;
      }

      const paymentUrl = data.data?.paymentUrl || data.data?.iframeUrl;
      if (paymentUrl) {
        toast.info("سيتم تحويلك إلى صفحة الدفع...");
        window.location.href = paymentUrl;
        return;
      }

      toast.warning(data.message || "يرجى التواصل معنا لإتمام الدفع");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "حدث خطأ، يرجى المحاولة لاحقاً",
      );
    } finally {
      setEnrolling(false);
    }
  };

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="animate-spin rounded-full h-16 w-16
          border-4 border-[#9b61db] border-t-transparent"
        />
      </div>
    );
  }

  if (!course) return null;

  const isFree = !course.price || Number(course.price) === 0;
  // Safe guard — features may be undefined on old documents
  const features = Array.isArray(course.features) ? course.features : [];
  const timeline = Array.isArray(course.timeline) ? course.timeline : [];
  const tags = Array.isArray(course.tags) ? course.tags : [];
  const visibleFeatures = showAll ? features : features.slice(0, 5);

  return (
    <div className="min-h-screen mt-32 pb-20 px-4 sm:px-6 lg:px-10" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-400 mb-6 flex items-center gap-2">
          <span
            className="cursor-pointer hover:text-white transition"
            onClick={() => navigate("/")}
          >
            الرئيسية
          </span>
          <span>/</span>
          <span
            className="cursor-pointer hover:text-white transition"
            onClick={() => navigate("/courses")}
          >
            الكورسات
          </span>
          <span>/</span>
          <span className="text-white truncate max-w-[200px]">
            {course.title_ar || course.title}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left: main info ── */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="rounded-2xl overflow-hidden mb-6 border border-white/10">
                {course.image ? (
                  <img
                    src={course.image}
                    alt={course.title_ar}
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-64 bg-gradient-to-br from-[#2d1b5a] to-[#1a0f3a]
                    flex items-center justify-center"
                  >
                    <BookOpen className="w-16 h-16 text-[#9b61db]" />
                  </div>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
                {course.title_ar || course.title}
              </h1>

              <p className="text-gray-300 leading-loose mb-4">
                {course.description_ar || course.description}
              </p>

              {/* Meta chips */}
              <div className="flex flex-wrap gap-3 text-sm">
                {course.instructor && (
                  <span className="bg-white/10 text-gray-300 px-3 py-1.5 rounded-full">
                    👨‍⚕️ {course.instructor}
                  </span>
                )}
                {course.duration && (
                  <span className="bg-white/10 text-gray-300 px-3 py-1.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {course.duration}
                  </span>
                )}
                {course.totalLessons > 0 && (
                  <span className="bg-white/10 text-gray-300 px-3 py-1.5 rounded-full flex items-center gap-1">
                    <Play className="w-3.5 h-3.5" /> {course.totalLessons} درس
                  </span>
                )}
                {course.category && (
                  <span className="bg-[#9b61db]/20 text-[#c4b5fd] px-3 py-1.5 rounded-full">
                    {course.category}
                  </span>
                )}
              </div>
            </motion.div>

            {/* Features */}
            {features.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6"
              >
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#9b61db]" />
                  ما ستتعلمه
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {visibleFeatures.map((feat, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-gray-300 text-sm"
                    >
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                      <span>
                        {typeof feat === "string" ? feat : feat?.text || feat}
                      </span>
                    </div>
                  ))}
                </div>
                {features.length > 5 && (
                  <button
                    onClick={() => setShowAll((p) => !p)}
                    className="mt-4 text-sm text-[#9b61db] hover:text-[#c4b5fd] flex items-center gap-1"
                  >
                    {showAll ? (
                      <>
                        <ChevronUp className="w-4 h-4" /> عرض أقل
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" /> عرض الكل (
                        {features.length})
                      </>
                    )}
                  </button>
                )}
              </motion.div>
            )}

            {/* Timeline */}
            {timeline.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6"
              >
                <h2 className="text-lg font-bold text-white mb-4">
                  محتوى الكورس
                </h2>
                <div className="space-y-3">
                  {timeline.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-gray-300 text-sm"
                    >
                      <div
                        className="w-6 h-6 rounded-full bg-[#9b61db]/30 border border-[#9b61db]
                        flex items-center justify-center text-xs text-[#c4b5fd] font-bold shrink-0"
                      >
                        {i + 1}
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Note */}
            {course.note && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
                <p className="text-amber-300 text-sm leading-relaxed">
                  💡 {course.note}
                </p>
              </div>
            )}
          </div>

          {/* ── Right: enrollment card ── */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 lg:sticky lg:top-32"
            >
              {/* Price */}
              <div className="mb-6 text-center">
                {isFree ? (
                  <span className="text-4xl font-extrabold text-green-400">
                    مجاني
                  </span>
                ) : (
                  <span className="text-4xl font-extrabold text-white">
                    {Number(course.price).toLocaleString()}
                    <span className="text-xl text-gray-400 mr-1">جنيه</span>
                  </span>
                )}
              </div>

              {/* CTA */}
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center
                  justify-center gap-2 transition-all mb-4
                  ${
                    isEnrolled
                      ? "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
                      : isFree
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg"
                        : "bg-gradient-to-r from-[#8349c7] to-[#9b61db] text-white hover:shadow-lg hover:shadow-[#9b61db]/30"
                  } disabled:opacity-60`}
              >
                {enrolling ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isEnrolled ? (
                  <>
                    <Play className="w-5 h-5" /> متابعة الكورس
                  </>
                ) : isFree ? (
                  <>
                    <BookOpen className="w-5 h-5" /> سجّل الآن مجاناً
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" /> اشترك الآن
                  </>
                )}
              </button>

              {/* Quick facts */}
              <div className="space-y-3 text-sm text-gray-400 border-t border-white/10 pt-4">
                {course.duration && (
                  <div className="flex items-center justify-between">
                    <span>المدة الإجمالية</span>
                    <span className="text-white font-medium">
                      {course.duration}
                    </span>
                  </div>
                )}
                {course.totalLessons > 0 && (
                  <div className="flex items-center justify-between">
                    <span>عدد الدروس</span>
                    <span className="text-white font-medium">
                      {course.totalLessons} درس
                    </span>
                  </div>
                )}
                {course.instructor && (
                  <div className="flex items-center justify-between">
                    <span>المدرب</span>
                    <span className="text-white font-medium">
                      {course.instructor}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>شهادة إتمام</span>
                  <span className="text-green-400 font-medium">✓ متضمنة</span>
                </div>
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
                  {tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs bg-white/10 text-gray-400 px-2.5 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
