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
import AnimatedText from "../../components/common/AnimatedContent";
import ComingSoon from "../../components/common/CommingSoon";

import { FEATURES } from "../../config/features";

// ─── Enrollment modal — collects name/email/phone ─────────────────────────────
const Courses = () => {
  const navigate = useNavigate();
  const { courses, getAllCourses, isLoading } = useContext(CourseContext);
  const [search, setSearch] = useState("");
  const [enrollModal, setEnrollModal] = useState(null); // course to enroll in

  useEffect(() => {
    if (courses.length === 0) getAllCourses();
  }, []);

  // ── Coming Soon gate — flip COURSES_COMING_SOON in src/config/features.js ──
  if (FEATURES.COURSES_COMING_SOON) {
    return (
      <ComingSoon
        title="الكورسات"
        subtitle="كورسات د. أحمد الخطيب قادمة قريباً — ترقبوا!"
      />
    );
  }

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
