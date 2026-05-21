/* eslint-disable no-unused-vars */
// pages/MyCourses.jsx  (user side)
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Play, Award, Clock, CheckCircle } from "lucide-react";
import { AppContext } from "../../context/AppContext";
import api from "../../api/axios.config";

const MyCourses = () => {
  const navigate = useNavigate();
  const { token } = useContext(AppContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchEnrolled();
  }, [token]);

  const fetchEnrolled = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/v1/courses/user/enrolled");
      if (data.success) {
        const raw = data.data;
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.courses)
            ? raw.courses
            : [];
        setCourses(list);
      }
    } catch (err) {
      console.error("fetchEnrolled:", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center mt-32">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-[#9b61db] border-t-transparent" />
      </div>
    );

  return (
    <div className="min-h-screen mt-32 mb-20 px-4 sm:px-6 lg:px-10" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            كورساتي
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {courses.length} كورس مسجل
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">
              لم تسجل في أي كورس بعد
            </h3>
            <p className="text-gray-400 mb-6">
              تصفح كورساتنا وابدأ رحلتك الصحية
            </p>
            <button
              onClick={() => navigate("/courses")}
              className="px-8 py-3 bg-gradient-to-r from-[#6d28d9] to-[#9b61db] text-white rounded-xl font-bold"
            >
              تصفح الكورسات
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course, i) => {
              const progress = course.progress || 0;
              const isCompleted = !!course.completedAt;

              return (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden
                    hover:shadow-md transition-shadow"
                >
                  {/* Thumbnail */}
                  <div className="relative h-44 overflow-hidden bg-gradient-to-br from-[#2d1b5a] to-[#1a0f3a]">
                    {course.image ? (
                      <img
                        src={course.image}
                        alt={course.title_ar}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-[#9b61db]" />
                      </div>
                    )}
                    {isCompleted && (
                      <div
                        className="absolute top-3 right-3 bg-green-500 text-white text-xs
                        font-bold px-3 py-1 rounded-full flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" /> مكتمل
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h3 className="font-bold text-gray-800 text-base mb-1 line-clamp-1">
                      {course.title_ar || course.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                      {course.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {course.duration}
                        </span>
                      )}
                      {course.totalLessons > 0 && (
                        <span className="flex items-center gap-1">
                          <Play className="w-3 h-3" />
                          {course.totalLessons} درس
                        </span>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>التقدم</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.8, delay: i * 0.06 + 0.3 }}
                          className={`h-2 rounded-full ${isCompleted ? "bg-green-500" : "bg-[#9b61db]"}`}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/learn/${course._id}`)}
                        className="flex-1 py-2.5 bg-gradient-to-r from-[#6d28d9] to-[#9b61db]
                          text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5
                          hover:shadow-lg transition"
                      >
                        <Play className="w-4 h-4" />
                        {isCompleted
                          ? "مراجعة"
                          : progress > 0
                            ? "متابعة"
                            : "ابدأ"}
                      </button>

                      {isCompleted && (
                        <button
                          onClick={() => navigate(`/certificate/${course._id}`)}
                          className="px-3 py-2.5 bg-green-50 text-green-700 rounded-xl text-sm
                            hover:bg-green-100 transition flex items-center gap-1"
                        >
                          <Award className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
