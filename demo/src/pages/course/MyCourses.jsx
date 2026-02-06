/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CourseContext } from "../../context/CourseContext";
import { AppContext } from "../../context/AppContext";
import { motion } from "framer-motion";
import {
  BookOpen,
  Clock,
  PlayCircle,
  Award,
  TrendingUp,
  Calendar,
  ChevronLeft,
  CheckCircle,
  BarChart3,
} from "lucide-react";

const MyCourses = () => {
  const navigate = useNavigate();
  const { enrolledCourses, getUserCourses, isLoading } =
    useContext(CourseContext);
  const { userData } = useContext(AppContext);

  const [stats, setStats] = useState({
    totalCourses: 0,
    inProgress: 0,
    completed: 0,
    totalProgress: 0,
    totalHours: 0,
  });

  useEffect(() => {
    getUserCourses();
  }, []);

  useEffect(() => {
    if (enrolledCourses.length > 0) {
      calculateStats();
    }
  }, [enrolledCourses]);

  const calculateStats = () => {
    const totalCourses = enrolledCourses.length;
    const completed = enrolledCourses.filter(
      (course) => course.progress === 100
    ).length;
    const inProgress = totalCourses - completed;
    const totalProgress =
      enrolledCourses.reduce((sum, course) => sum + (course.progress || 0), 0) /
      totalCourses;

    // تقدير الساعات (افتراضي 10 ساعات لكل دورة)
    const totalHours = Math.round(totalCourses * 10);

    setStats({
      totalCourses,
      inProgress,
      completed,
      totalProgress: Math.round(totalProgress),
      totalHours,
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getProgressColor = (progress) => {
    if (progress < 30) return "from-red-500 to-orange-500";
    if (progress < 70) return "from-yellow-500 to-amber-500";
    return "from-green-500 to-emerald-500";
  };

  const pageVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-textSoft text-lg">جاري تحميل دوراتك...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={pageVariants}
      className="my-12 px-4 sm:px-6 text-textMain"
      dir="rtl"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">
          مرحباً {userData?.name} 👋
        </h1>
        <p className="text-textSoft text-lg">هذه هي دوراتك التدريبية</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-borderLight">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textSoft">إجمالي الدورات</p>
              <p className="text-2xl font-bold mt-2">{stats.totalCourses}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <BookOpen className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-borderLight">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textSoft">قيد التنفيذ</p>
              <p className="text-2xl font-bold mt-2">{stats.inProgress}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-xl">
              <TrendingUp className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-borderLight">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textSoft">المكتملة</p>
              <p className="text-2xl font-bold mt-2">{stats.completed}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <Award className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-borderLight">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textSoft">التقدم العام</p>
              <p className="text-2xl font-bold mt-2">{stats.totalProgress}%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <BarChart3 className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Courses Grid */}
      {enrolledCourses.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl shadow-lg p-12 text-center"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-lightBg rounded-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-textSoft" />
          </div>
          <h3 className="text-2xl font-bold text-textMain mb-2">
            لا توجد دورات مسجلة
          </h3>
          <p className="text-textSoft mb-6">
            ابدأ رحلة التعلم معنا واشترك في دوراتنا التدريبية
          </p>
          <button
            onClick={() => navigate("/courses")}
            className="bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 px-8 rounded-xl hover:from-secondary hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            تصفح الدورات
          </button>
        </motion.div>
      ) : (
        <>
          <motion.div variants={itemVariants} className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-primary">دوراتك</h2>
              <span className="text-textSoft">
                {enrolledCourses.length} دورة
              </span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course, index) => (
              <motion.div
                key={course._id}
                variants={itemVariants}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-borderLight hover:shadow-xl transition-all duration-300"
              >
                {/* Course Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={course.thumbnail}
                    alt={course.title_ar}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    {course.category}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getProgressColor(
                          course.progress || 0
                        )}`}
                        style={{ width: `${course.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Course Info */}
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">
                    {course.title_ar}
                  </h3>

                  <div className="flex items-center justify-between mb-4 text-sm text-textSoft">
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      <span>{course.totalDuration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen size={14} />
                      <span>{course.totalLessons} درس</span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span>تقدمك</span>
                      <span className="font-bold">{course.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getProgressColor(
                          course.progress || 0
                        )}`}
                        style={{ width: `${course.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/learn/${course._id}`)}
                      className="flex-1 bg-gradient-to-r from-primary to-secondary text-white font-bold py-2 rounded-xl hover:from-secondary hover:to-primary transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {course.progress === 100 ? (
                        <>
                          <CheckCircle size={18} />
                          معاينة
                        </>
                      ) : (
                        <>
                          <PlayCircle size={18} />
                          {course.progress > 0 ? "استمر" : "ابدأ"}
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => navigate(`/course/${course._id}`)}
                      className="px-4 border border-borderLight rounded-xl hover:bg-lightBg transition-colors flex items-center justify-center"
                    >
                      <ChevronLeft size={18} />
                    </button>
                  </div>

                  {/* Enrollment Date */}
                  {course.enrolledAt && (
                    <div className="mt-4 pt-4 border-t border-borderLight flex items-center gap-2 text-xs text-textSoft">
                      <Calendar size={12} />
                      <span>مسجل منذ {formatDate(course.enrolledAt)}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
};

export default MyCourses;
