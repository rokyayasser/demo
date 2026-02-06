/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CourseContext } from "../../context/CourseContext";
import { AppContext } from "../../context/AppContext";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Star,
  Clock,
  Users,
  PlayCircle,
  BookOpen,
  ChevronLeft,
  Award,
  Target,
  CheckCircle,
} from "lucide-react";

const Courses = () => {
  const navigate = useNavigate();
  const { courses, getAllCourses, isLoading } = useContext(CourseContext);
  const { token } = useContext(AppContext);

  const [filteredCourses, setFilteredCourses] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const pageVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
    exit: { opacity: 0 },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    hover: {
      y: -10,
      scale: 1.02,
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
      transition: {
        duration: 0.3,
      },
    },
  };

  // استخراج التصنيفات الفريدة
  const uniqueCategories = [
    ...new Set(courses.map((course) => course.category)),
  ];
  const uniqueLevels = ["all", "مبتدئ", "متوسط", "متقدم"];

  const applyFilters = () => {
    let filtered = [...courses];

    // فلترة حسب البحث
    if (searchTerm) {
      filtered = filtered.filter(
        (course) =>
          course.title_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description_ar
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          course.instructor_ar.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // فلترة حسب التصنيف
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (course) => course.category === selectedCategory
      );
    }

    // فلترة حسب المستوى
    if (selectedLevel !== "all") {
      filtered = filtered.filter((course) => course.level === selectedLevel);
    }

    // ترتيب النتائج
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "price-low":
        filtered.sort(
          (a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price)
        );
        break;
      case "price-high":
        filtered.sort(
          (a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price)
        );
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "popular":
        filtered.sort((a, b) => b.studentsEnrolled - a.studentsEnrolled);
        break;
    }

    setFilteredCourses(filtered);
  };

  useEffect(() => {
    getAllCourses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [courses, searchTerm, selectedCategory, selectedLevel, sortBy]);

  const handleEnrollClick = (courseId, e) => {
    e.stopPropagation();

    if (!token) {
      navigate("/login", { state: { from: `/course/${courseId}` } });
      return;
    }

    navigate(`/course/${courseId}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("ar-EG").format(price);
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="my-12 px-4 sm:px-6 text-textMain"
      dir="rtl"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="text-center mb-12 max-w-3xl mx-auto"
      >
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl md:text-4xl font-bold text-primary mb-4"
        >
          الدورات التدريبية
        </motion.h1>
        <motion.p
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-textSoft text-lg"
        >
          تعلم من أفضل الخبراء في مجالك وطور مهاراتك
        </motion.p>
      </motion.div>

      {/* Search and Filters Bar */}
      <motion.div
        variants={itemVariants}
        className="mb-8 bg-white rounded-2xl shadow-lg p-6 border border-borderLight"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="ابحث عن دورة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-right"
              dir="rtl"
            />
          </div>

          {/* Filter Toggle (Mobile) */}
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="md:hidden flex items-center gap-2 px-4 py-3 border border-borderLight rounded-xl hover:bg-lightBg transition-colors"
          >
            <Filter size={20} />
            <span>الفلاتر</span>
          </button>

          {/* Sort Select */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 border border-borderLight rounded-xl bg-white text-right"
            dir="rtl"
          >
            <option value="newest">الأحدث</option>
            <option value="oldest">الأقدم</option>
            <option value="price-low">السعر: من الأقل للأعلى</option>
            <option value="price-high">السعر: من الأعلى للأقل</option>
            <option value="rating">التقييم</option>
            <option value="popular">الأكثر شعبية</option>
          </select>
        </div>

        {/* Expanded Filters (Mobile) */}
        {showFilter && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-6 pt-6 border-t border-borderLight md:hidden"
          >
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-textMain mb-2">
                  التصنيف
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-borderLight rounded-xl text-right"
                  dir="rtl"
                >
                  <option value="all">جميع التصنيفات</option>
                  {uniqueCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-textMain mb-2">
                  المستوى
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-4 py-2 border border-borderLight rounded-xl text-right"
                  dir="rtl"
                >
                  {uniqueLevels.map((level) => (
                    <option key={level} value={level}>
                      {level === "all" ? "جميع المستويات" : level}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Desktop Filters */}
        <div className="hidden md:grid md:grid-cols-2 gap-4 mt-6">
          <div>
            <label className="block text-sm font-medium text-textMain mb-2">
              التصنيف
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === "all"
                    ? "bg-primary text-white"
                    : "bg-lightBg text-textMain hover:bg-accent"
                }`}
              >
                الكل
              </button>
              {uniqueCategories.slice(0, 5).map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === category
                      ? "bg-primary text-white"
                      : "bg-lightBg text-textMain hover:bg-accent"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Courses Grid */}
      <motion.div variants={itemVariants}>
        {isLoading ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
              <p className="text-textSoft text-lg">جاري تحميل الدورات...</p>
            </div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-lightBg rounded-full flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-textSoft" />
            </div>
            <h3 className="text-2xl font-bold text-textMain mb-2">
              لا توجد دورات
            </h3>
            <p className="text-textSoft">
              {searchTerm
                ? "لم يتم العثور على دورات تطابق بحثك"
                : "لا توجد دورات متاحة حالياً"}
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course._id}
                variants={cardVariants}
                whileHover="hover"
                className="relative border border-borderLight rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-white cursor-pointer"
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(`/course/${course._id}`)}
              >
                {/* Course Image */}
                <div className="relative h-56 overflow-hidden">
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full h-full object-cover"
                    src={course.thumbnail}
                    alt={course.title_ar}
                  />
                  <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    {course.category}
                  </div>

                  {/* Featured Badge */}
                  {course.isFeatured && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      مميز
                    </div>
                  )}
                </div>

                {/* Course Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-textMain flex-1">
                      {course.title_ar}
                    </h3>
                    {/* Level Badge */}
                    <div
                      className={`px-2 py-1 rounded-full text-xs ${
                        course.level === "مبتدئ"
                          ? "bg-green-100 text-green-700"
                          : course.level === "متوسط"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {course.level}
                    </div>
                  </div>

                  <p className="text-textSoft text-sm leading-relaxed mb-4 line-clamp-2">
                    {course.description_ar}
                  </p>

                  {/* Instructor */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold">
                      {course.instructor_ar.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm text-textSoft">المدرب</p>
                      <p className="font-medium">{course.instructor_ar}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between mb-5 text-sm text-textSoft">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        <span>{course.totalDuration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <PlayCircle size={16} />
                        <span>{course.totalLessons} درس</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={16} />
                        <span>{course.studentsEnrolled} طالب</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star
                        className="text-yellow-400 fill-current"
                        size={16}
                      />
                      <span>{course.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Price and Action */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-2xl text-primary">
                        {formatPrice(course.discountPrice || course.price)} جنيه
                      </span>
                      {course.discountPrice && (
                        <span className="text-sm text-textSoft line-through">
                          {formatPrice(course.price)} جنيه
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleEnrollClick(course._id, e)}
                      className="bg-gradient-to-r from-primary to-secondary text-white font-bold py-2 px-6 rounded-xl hover:from-secondary hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      {token ? "عرض الدورة" : "سجل الآن"}
                    </button>
                  </div>

                  {/* Preview Lessons */}
                  {course.lessons &&
                    course.lessons.some((lesson) => lesson.isPreview) && (
                      <div className="text-sm text-primary font-medium flex items-center gap-1 hover:text-secondary transition-colors">
                        <PlayCircle size={16} />
                        <span>دروس معاينة مجانية</span>
                        <ChevronLeft size={16} />
                      </div>
                    )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Stats Summary */}
      {!isLoading && filteredCourses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl p-6 shadow-lg"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold">{courses.length}</p>
              <p className="text-white/90">دورة متاحة</p>
            </div>
            <div>
              <p className="text-3xl font-bold">
                {Math.round(
                  courses.reduce(
                    (sum, course) => sum + course.studentsEnrolled,
                    0
                  ) / courses.length
                ) || 0}
              </p>
              <p className="text-white/90">طالب في المتوسط</p>
            </div>
            <div>
              <p className="text-3xl font-bold">
                {Math.round(
                  courses.reduce((sum, course) => sum + course.rating, 0) /
                    courses.length
                ) || 0}
              </p>
              <p className="text-white/90">تقييم متوسط</p>
            </div>
            <div>
              <p className="text-3xl font-bold">
                {Math.round(
                  courses.reduce(
                    (sum, course) => sum + course.totalLessons,
                    0
                  ) / courses.length
                ) || 0}
              </p>
              <p className="text-white/90">درس في المتوسط</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// Add missing variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default Courses;
