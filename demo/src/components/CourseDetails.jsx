/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CourseContext } from "../context/CourseContext";
import { AppContext } from "../context/AppContext";
import { motion } from "framer-motion";
import {
  Star,
  Clock,
  Users,
  PlayCircle,
  CheckCircle,
  FileText,
  Download,
  ArrowLeft,
  ShoppingCart,
  BookOpen,
  Award,
  ChevronLeft,
  Shield,
  Globe,
  Target,
  Lock,
  Eye,
  Heart,
  Share2,
  X,
  Video,
  Loader,
} from "lucide-react";
import { toast } from "react-toastify";

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const {
    currentCourse,
    getCourseDetails,
    checkEnrollment,
    initiateCoursePayment,
    isLoading,
    clearLoading,
  } = useContext(CourseContext);

  const { token, userData } = useContext(AppContext);

  const [enrollmentStatus, setEnrollmentStatus] = useState({
    isEnrolled: false,
    loading: true,
    checking: false,
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLiked, setIsLiked] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showPromoVideo, setShowPromoVideo] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const pollingRef = useRef(null);

  // Load course details on mount
  useEffect(() => {
    loadCourseData();

    return () => {
      // Cleanup polling on unmount
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [courseId]);

  // Check enrollment when token changes
  useEffect(() => {
    if (token && courseId) {
      checkUserEnrollment();
    } else {
      setEnrollmentStatus({
        isEnrolled: false,
        loading: false,
        checking: false,
      });
    }
  }, [token, courseId]);

  const loadCourseData = async () => {
    try {
      await getCourseDetails(courseId);
    } catch (error) {
      console.error("Error loading course data:", error);
    }
  };

  const checkUserEnrollment = async () => {
    try {
      setEnrollmentStatus((prev) => ({ ...prev, checking: true }));
      const response = await checkEnrollment(courseId);
      console.log("Enrollment response:", response);

      setEnrollmentStatus({
        isEnrolled: response.isEnrolled || false,
        loading: false,
        checking: false,
      });
    } catch (error) {
      console.error("Error checking enrollment:", error);
      setEnrollmentStatus({
        isEnrolled: false,
        loading: false,
        checking: false,
      });
    }
  };

  const startEnrollmentPolling = () => {
    // Clear any existing polling
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    // Start new polling
    pollingRef.current = setInterval(() => {
      checkUserEnrollment();
    }, 5000); // Check every 5 seconds

    // Stop polling after 10 minutes
    setTimeout(() => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }, 600000);
  };

  const handleEnroll = () => {
    if (!token) {
      toast.info("يجب تسجيل الدخول أولاً للاشتراك في الدورة");
      navigate("/login", { state: { from: `/course/${courseId}` } });
      return;
    }

    if (enrollmentStatus.isEnrolled) {
      navigate(`/learn/${courseId}`);
    } else {
      setShowPaymentModal(true);
    }
  };

  const handlePayment = async () => {
    try {
      setIsProcessingPayment(true);
      setShowPaymentModal(false);

      const result = await initiateCoursePayment(courseId);

      if (result && result.paymentUrl) {
        toast.success("جارٍ التوجيه إلى صفحة الدفع...");

        // Start polling for enrollment status after a delay
        setTimeout(() => {
          startEnrollmentPolling();
        }, 3000);
      }
    } catch (error) {
      toast.error("فشل بدء عملية الدفع");
      console.error("Payment error:", error);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = `تحقق من هذه الدورة: ${currentCourse?.title_ar}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: currentCourse?.title_ar,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("تم نسخ رابط الدورة");
      setShowShareOptions(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("ar-EG").format(price || 0);
  };

  const formatDuration = (duration) => {
    if (!duration) return "غير محدد";
    return duration;
  };

  if (isLoading || !currentCourse) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-textSoft text-lg">جاري تحميل تفاصيل الدورة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <button
            onClick={() => navigate("/courses")}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-6"
          >
            <ArrowLeft size={20} />
            العودة إلى الدورات
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2">
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm mb-4">
                {currentCourse.category}
              </span>
              <h1 className="text-4xl font-bold mb-4">
                {currentCourse.title_ar}
              </h1>
              <p className="text-xl mb-6 text-white/90">
                {currentCourse.description_ar}
              </p>

              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Users size={20} />
                  <span>{currentCourse.studentsEnrolled || 0} طالب</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={20} />
                  <span>{formatDuration(currentCourse.totalDuration)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={20} className="fill-current" />
                  <span>{currentCourse.rating?.toFixed(1) || "0.0"} تقييم</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen size={20} />
                  <span>{currentCourse.totalLessons || 0} درس</span>
                </div>
              </div>

              {/* Promo Video Button */}
              {currentCourse.promotionalVideo && (
                <div className="mb-6">
                  <button
                    onClick={() => setShowPromoVideo(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors"
                  >
                    <PlayCircle size={20} />
                    مشاهدة الفيديو التعريفي
                  </button>
                </div>
              )}

              {/* Instructor */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-white/20 to-white/10 border-2 border-white/30 flex items-center justify-center">
                  <span className="text-2xl font-bold">
                    {currentCourse.instructor_ar?.charAt(0) || "م"}
                  </span>
                </div>
                <div>
                  <p className="font-medium">المدرب</p>
                  <p className="text-lg">
                    {currentCourse.instructor_ar || "غير محدد"}
                  </p>
                  {currentCourse.instructorBio_ar && (
                    <p className="text-white/80 text-sm mt-1">
                      {currentCourse.instructorBio_ar}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Enrollment Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-4">
                  {currentCourse.discountPrice ? (
                    <>
                      <span className="text-3xl font-bold">
                        {formatPrice(currentCourse.discountPrice)} جنيه
                      </span>
                      <span className="text-lg line-through text-white/60">
                        {formatPrice(currentCourse.price)} جنيه
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold">
                      {formatPrice(currentCourse.price)} جنيه
                    </span>
                  )}
                </div>

                {enrollmentStatus.checking || isProcessingPayment ? (
                  <button
                    className="w-full py-3 bg-gray-400 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
                    disabled
                  >
                    <Loader className="animate-spin" size={20} />
                    جاري التحقق...
                  </button>
                ) : enrollmentStatus.isEnrolled ? (
                  <button
                    onClick={() => navigate(`/learn/${courseId}`)}
                    className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <PlayCircle size={20} />
                    متابعة التعلم
                  </button>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={isProcessingPayment}
                    className="w-full py-3 bg-white text-primary rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart size={20} />
                    {isProcessingPayment ? "جاري المعالجة..." : "اشترك الآن"}
                  </button>
                )}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} />
                  <span>وصول مدى الحياة</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award size={18} />
                  <span>شهادة إتمام</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield size={18} />
                  <span>ضمان استعادة المال خلال 30 يوم</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe size={18} />
                  <span>متاح على جميع الأجهزة</span>
                </div>
                {currentCourse.promotionalVideo && (
                  <div className="flex items-center gap-2">
                    <Video size={18} />
                    <span>فيديو تعريفي مجاني</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-white/20">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 ${
                    isLiked
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  <Heart size={18} className={isLiked ? "fill-current" : ""} />
                  <span>{isLiked ? "تم الإعجاب" : "أعجبني"}</span>
                </button>
                <button
                  onClick={() => setShowShareOptions(!showShareOptions)}
                  className="flex-1 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 flex items-center justify-center gap-2"
                >
                  <Share2 size={18} />
                  <span>مشاركة</span>
                </button>
              </div>

              {/* Share Options */}
              {showShareOptions && (
                <div className="mt-4 p-3 bg-white/20 rounded-xl">
                  <div className="flex gap-2">
                    <button
                      onClick={handleShare}
                      className="flex-1 py-2 bg-white text-primary rounded-lg hover:bg-gray-100"
                    >
                      نسخ الرابط
                    </button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        window.location.href
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center"
                    >
                      واتساب
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="sticky top-0 z-10 bg-white border-b border-borderLight">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto">
            {["overview", "curriculum", "resources", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-textSoft hover:text-textMain"
                }`}
              >
                {tab === "overview" && "نظرة عامة"}
                {tab === "curriculum" && "المحتوى"}
                {tab === "resources" && "الموارد"}
                {tab === "reviews" && "التقييمات"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Promo Video Section - UPDATED */}
              {currentCourse.promotionalVideo && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                      <Video size={24} />
                      الفيديو التعريفي
                    </h2>
                    <button
                      onClick={() => setShowPromoVideo(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-secondary transition-colors"
                    >
                      <PlayCircle size={20} />
                      تشغيل الفيديو
                    </button>
                  </div>
                  <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden">
                    {currentCourse.thumbnail ? (
                      <img
                        src={currentCourse.thumbnail}
                        alt="فيديو تعريفي"
                        className="w-full h-full object-cover opacity-50"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-primary to-secondary opacity-50"></div>
                    )}
                    <button
                      onClick={() => setShowPromoVideo(true)}
                      className="absolute inset-0 flex items-center justify-center group"
                    >
                      <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
                        <PlayCircle className="text-white" size={40} />
                      </div>
                    </button>
                    <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
                      الفيديو التعريفي
                    </div>
                  </div>
                </motion.div>
              )}

              {/* What You'll Learn */}
              {currentCourse.whatYouWillLearn &&
                currentCourse.whatYouWillLearn.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-lg p-6"
                  >
                    <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                      <Target size={24} />
                      ماذا سوف تتعلم؟
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {currentCourse.whatYouWillLearn.map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle
                            className="text-green-500 mt-1 flex-shrink-0"
                            size={18}
                          />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

              {/* Course Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h2 className="text-2xl font-bold text-primary mb-4">
                  عن الدورة
                </h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-textMain leading-relaxed whitespace-pre-line">
                    {currentCourse.description_ar}
                  </p>
                </div>
              </motion.div>

              {/* Requirements */}
              {currentCourse.requirements &&
                currentCourse.requirements.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl shadow-lg p-6"
                  >
                    <h2 className="text-2xl font-bold text-primary mb-4">
                      المتطلبات
                    </h2>
                    <ul className="space-y-2">
                      {currentCourse.requirements.map((req, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Features */}
              {currentCourse.features && currentCourse.features.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-2xl shadow-lg p-6"
                >
                  <h3 className="text-xl font-bold text-primary mb-4">
                    مميزات الدورة
                  </h3>
                  <div className="space-y-3">
                    {currentCourse.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <CheckCircle className="text-green-500" size={18} />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Course Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-primary to-secondary text-white rounded-2xl p-6"
              >
                <h3 className="text-xl font-bold mb-4">إحصائيات الدورة</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>عدد الطلاب</span>
                    <span className="font-bold">
                      {currentCourse.studentsEnrolled || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>التقييم</span>
                    <div className="flex items-center gap-1">
                      <Star className="fill-current" size={16} />
                      <span className="font-bold">
                        {currentCourse.rating?.toFixed(1) || "0.0"}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>عدد الدروس</span>
                    <span className="font-bold">
                      {currentCourse.totalLessons || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>المدة</span>
                    <span className="font-bold">
                      {formatDuration(currentCourse.totalDuration)}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Course Level */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h3 className="text-xl font-bold text-primary mb-4">
                  تفاصيل الدورة
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-textSoft">المستوى</span>
                    <span className="font-medium">
                      {currentCourse.level || "غير محدد"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-textSoft">اللغة</span>
                    <span className="font-medium">
                      {currentCourse.language || "العربية"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-textSoft">المدرب</span>
                    <span className="font-medium">
                      {currentCourse.instructor_ar || "غير محدد"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-textSoft">تاريخ النشر</span>
                    <span className="font-medium">
                      {currentCourse.createdAt
                        ? new Date(currentCourse.createdAt).toLocaleDateString(
                            "ar-EG"
                          )
                        : "غير محدد"}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {activeTab === "curriculum" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-primary mb-6">
              منهج الدورة
            </h2>
            <div className="space-y-4">
              {currentCourse.lessons && currentCourse.lessons.length > 0 ? (
                currentCourse.lessons
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((lesson, index) => (
                    <div
                      key={lesson._id || index}
                      className={`border border-borderLight rounded-xl p-4 transition-all ${
                        lesson.isPreview
                          ? "bg-blue-50 border-blue-200"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                              lesson.isPreview
                                ? "bg-blue-100 text-blue-600"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {lesson.title_ar || "درس بدون عنوان"}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                              <span>{lesson.duration || "00:00"}</span>
                              {lesson.isPreview && (
                                <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                                  معاينة مجانية
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {!enrollmentStatus.isEnrolled && !lesson.isPreview ? (
                          <span className="text-gray-400">
                            <Lock size={20} />
                          </span>
                        ) : (
                          <PlayCircle
                            className="text-primary cursor-pointer hover:text-secondary"
                            size={20}
                          />
                        )}
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-center text-gray-500 py-8">
                  لا توجد دروس متاحة حالياً
                </p>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "resources" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-primary mb-6">الموارد</h2>
            {currentCourse.resources && currentCourse.resources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentCourse.resources.map((resource, index) => (
                  <a
                    key={index}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-borderLight rounded-xl p-4 hover:border-primary hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="text-primary" size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-textMain">
                          {resource.title}
                        </h4>
                        <p className="text-sm text-textSoft mt-1">
                          {resource.type}
                        </p>
                      </div>
                      <Download className="text-textSoft" size={18} />
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                لا توجد موارد متاحة حالياً
              </p>
            )}
          </motion.div>
        )}

        {activeTab === "reviews" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-primary">
                تقييمات الطلاب
              </h2>
              <div className="flex items-center gap-2">
                <Star className="text-yellow-400 fill-current" size={24} />
                <span className="text-2xl font-bold">
                  {currentCourse.rating?.toFixed(1) || "0.0"}
                </span>
                <span className="text-textSoft">
                  ({currentCourse.reviewsCount || 0} تقييم)
                </span>
              </div>
            </div>

            {/* Rating Summary */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center gap-2">
                        <div className="w-20 text-sm">{star} نجوم</div>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400"
                            style={{ width: "70%" }}
                          ></div>
                        </div>
                        <div className="w-10 text-sm text-right">70%</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-6xl font-bold text-primary mb-2">
                    {currentCourse.rating?.toFixed(1) || "0.0"}
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={`${
                          i < Math.floor(currentCourse.rating || 0)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-textSoft">متوسط التقييمات</p>
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
              {currentCourse.ratings && currentCourse.ratings.length > 0 ? (
                currentCourse.ratings.slice(0, 5).map((rating, index) => (
                  <div
                    key={index}
                    className="border-b border-borderLight pb-6 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold">
                          {rating.userId?.name?.charAt(0) || "م"}
                        </div>
                        <div>
                          <h4 className="font-medium">
                            {rating.userId?.name || "مستخدم"}
                          </h4>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={`${
                                  i < (rating.rating || 0)
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-textSoft">
                        {rating.createdAt
                          ? new Date(rating.createdAt).toLocaleDateString(
                              "ar-EG"
                            )
                          : "غير معروف"}
                      </span>
                    </div>
                    {rating.review && (
                      <p className="text-textMain">{rating.review}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">
                  لا توجد تقييمات حتى الآن
                </p>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Promo Video Modal - UPDATED */}
      {showPromoVideo && currentCourse.promotionalVideo && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setShowPromoVideo(false)}
              className="absolute -top-10 left-0 text-white hover:text-gray-300 z-10 p-2"
            >
              <X size={24} />
            </button>
            <div className="bg-black rounded-lg overflow-hidden">
              <video
                src={currentCourse.promotionalVideo}
                controls
                autoPlay
                className="w-full max-h-[80vh]"
                controlsList="nodownload"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-6"
          >
            <h3 className="text-xl font-bold mb-4">إتمام الاشتراك</h3>
            <p className="text-gray-600 mb-6">
              أنت على وشك الاشتراك في دورة{" "}
              <strong>{currentCourse.title_ar}</strong>
            </p>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span>سعر الدورة:</span>
                <span className="font-semibold">
                  {formatPrice(
                    currentCourse.discountPrice || currentCourse.price
                  )}{" "}
                  جنيه
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span>المجموع:</span>
                <span>
                  {formatPrice(
                    currentCourse.discountPrice || currentCourse.price
                  )}{" "}
                  جنيه
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                disabled={isProcessingPayment}
              >
                إلغاء
              </button>
              <button
                onClick={handlePayment}
                disabled={isProcessingPayment}
                className="flex-1 py-3 bg-primary text-white rounded-xl hover:bg-secondary font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessingPayment ? "جاري المعالجة..." : "متابعة الدفع"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CourseDetails;
