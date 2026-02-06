/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminContext } from "../../context/AdminContext";
import { motion } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Play,
  Lock,
  Unlock,
  ArrowLeft,
  Clock,
  Upload,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

const AdminCourseLessons = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { aToken, backendUrl } = useContext(AdminContext);

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    title_ar: "",
    description: "",
    duration: "00:00",
    order: 1,
    isPreview: false,
  });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  useEffect(() => {
    fetchCourseDetails();
    fetchLessons();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/courses/${courseId}`,
        {
          headers: { token: aToken },
        }
      );

      if (response.data.success) {
        setCourse(response.data.course);
      }
    } catch (error) {
      toast.error("فشل في تحميل تفاصيل الدورة");
    }
  };

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${backendUrl}/api/courses/${courseId}`,
        {
          headers: { token: aToken },
        }
      );

      if (response.data.success) {
        setLessons(response.data.course.lessons || []);
      }
    } catch (error) {
      toast.error("فشل في تحميل الدروس");
    } finally {
      setLoading(false);
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const formDataToSend = new FormData();

      // إضافة البيانات النصية
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      // إضافة الملفات
      if (videoFile) {
        formDataToSend.append("video", videoFile);
      }
      if (thumbnailFile) {
        formDataToSend.append("thumbnail", thumbnailFile);
      }

      const response = await axios.post(
        `${backendUrl}/api/courses/admin/${courseId}/lesson`,
        formDataToSend,
        {
          headers: {
            token: aToken,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("تم إضافة الدرس بنجاح");
        setShowAddModal(false);
        resetForm();
        fetchLessons();
      }
    } catch (error) {
      toast.error("فشل في إضافة الدرس");
      console.error("Error adding lesson:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الدرس؟")) return;

    try {
      setLoading(true);
      // Note: You need to implement delete lesson endpoint in backend
      const response = await axios.delete(
        `${backendUrl}/api/courses/admin/${courseId}/lesson/${lessonId}`,
        { headers: { token: aToken } }
      );

      if (response.data.success) {
        toast.success("تم حذف الدرس بنجاح");
        fetchLessons();
      }
    } catch (error) {
      toast.error("فشل في حذف الدرس");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      title_ar: "",
      description: "",
      duration: "00:00",
      order: lessons.length + 1,
      isPreview: false,
    });
    setVideoFile(null);
    setThumbnailFile(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-6xl mx-auto p-4 sm:p-6"
      dir="rtl"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/courses")}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">
                {course?.title_ar || "دروس الدورة"}
              </h1>
              <p className="text-textSoft">إدارة دروس الدورة</p>
            </div>
          </div>
          <button
            onClick={openAddModal}
            className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl font-bold hover:from-secondary hover:to-primary transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            إضافة درس جديد
          </button>
        </div>

        {/* Course Stats */}
        {course && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-borderLight">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-textSoft">عدد الدروس</p>
                  <p className="text-2xl font-bold mt-2">
                    {course.totalLessons}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Play className="text-blue-600" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-borderLight">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-textSoft">المدة الإجمالية</p>
                  <p className="text-2xl font-bold mt-2">
                    {course.totalDuration}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <Clock className="text-green-600" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-borderLight">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-textSoft">الحالة</p>
                  <p className="text-2xl font-bold mt-2">
                    {course.isPublished ? "منشور" : "مخفي"}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-xl">
                  {course.isPublished ? (
                    <Unlock className="text-yellow-600" size={24} />
                  ) : (
                    <Lock className="text-yellow-600" size={24} />
                  )}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-borderLight">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-textSoft">التقييم</p>
                  <p className="text-2xl font-bold mt-2">
                    {course.rating.toFixed(1)}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <div className="text-purple-600 font-bold">★</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lessons List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
          <div className="w-24 h-24 mx-auto mb-6 bg-lightBg rounded-full flex items-center justify-center">
            <Play className="w-12 h-12 text-textSoft" />
          </div>
          <h3 className="text-2xl font-bold text-textMain mb-2">
            لا توجد دروس
          </h3>
          <p className="text-textSoft mb-6">ابدأ بإضافة أول درس للدورة</p>
          <button
            onClick={openAddModal}
            className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-secondary transition-colors"
          >
            إضافة أول درس
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-borderLight">
                  <th className="py-4 px-6 text-right font-bold text-textMain">
                    #
                  </th>
                  <th className="py-4 px-6 text-right font-bold text-textMain">
                    الدرس
                  </th>
                  <th className="py-4 px-6 text-right font-bold text-textMain">
                    المدة
                  </th>
                  <th className="py-4 px-6 text-right font-bold text-textMain">
                    النوع
                  </th>
                  <th className="py-4 px-6 text-right font-bold text-textMain">
                    الترتيب
                  </th>
                  <th className="py-4 px-6 text-right font-bold text-textMain">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {lessons
                  .sort((a, b) => a.order - b.order)
                  .map((lesson, index) => (
                    <tr
                      key={lesson._id || index}
                      className="border-b border-borderLight hover:bg-gray-50"
                    >
                      <td className="py-4 px-6">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          {lesson.thumbnail ? (
                            <img
                              src={lesson.thumbnail}
                              alt={lesson.title_ar}
                              className="w-16 h-12 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Play className="text-gray-400" size={20} />
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold text-textMain">
                              {lesson.title_ar}
                            </h4>
                            <p className="text-sm text-textSoft line-clamp-1">
                              {lesson.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-textSoft" />
                          <span>{lesson.duration}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            lesson.isPreview
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {lesson.isPreview ? "معاينة مجانية" : "مدفوع"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-gray-100 rounded-lg font-bold">
                          {lesson.order}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <a
                            href={lesson.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                            title="مشاهدة"
                          >
                            <Play size={16} />
                          </a>
                          <button
                            onClick={() => handleDeleteLesson(lesson._id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            title="حذف"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Lesson Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-2xl w-full"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-primary">
                  إضافة درس جديد
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddLesson}>
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-textMain mb-2">
                        عنوان الدرس (الإنجليزية) *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-textMain mb-2">
                        عنوان الدرس (العربية) *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title_ar}
                        onChange={(e) =>
                          setFormData({ ...formData, title_ar: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-textMain mb-2">
                      الوصف
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-textMain mb-2">
                        المدة (دقيقة:ثانية) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="15:30"
                        value={formData.duration}
                        onChange={(e) =>
                          setFormData({ ...formData, duration: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-textMain mb-2">
                        ترتيب الدرس *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.order}
                        onChange={(e) =>
                          setFormData({ ...formData, order: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* File Uploads */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-textMain mb-2">
                        فيديو الدرس *
                      </label>
                      <div className="border-2 border-dashed border-borderLight rounded-xl p-4 text-center hover:border-primary transition-colors">
                        <Upload
                          className="mx-auto mb-2 text-textSoft"
                          size={20}
                        />
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => setVideoFile(e.target.files[0])}
                          className="hidden"
                          id="lesson-video-upload"
                          required
                        />
                        <label
                          htmlFor="lesson-video-upload"
                          className="cursor-pointer text-primary font-medium hover:text-secondary"
                        >
                          {videoFile ? videoFile.name : "اختر فيديو الدرس"}
                        </label>
                        <p className="text-xs text-textSoft mt-1">
                          MP4, MOV - الحد الأقصى 100MB
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-textMain mb-2">
                        صورة مصغرة (اختياري)
                      </label>
                      <div className="border-2 border-dashed border-borderLight rounded-xl p-4 text-center hover:border-primary transition-colors">
                        <Upload
                          className="mx-auto mb-2 text-textSoft"
                          size={20}
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setThumbnailFile(e.target.files[0])}
                          className="hidden"
                          id="lesson-thumbnail-upload"
                        />
                        <label
                          htmlFor="lesson-thumbnail-upload"
                          className="cursor-pointer text-primary font-medium hover:text-secondary"
                        >
                          {thumbnailFile
                            ? thumbnailFile.name
                            : "اختر صورة مصغرة"}
                        </label>
                        <p className="text-xs text-textSoft mt-1">
                          JPEG, PNG - الحد الأقصى 5MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPreview}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isPreview: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-primary rounded focus:ring-primary"
                    />
                    <span className="text-textMain">معاينة مجانية</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-6 border-t border-borderLight">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 border border-borderLight rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold hover:from-secondary hover:to-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "جاري الإضافة..." : "إضافة الدرس"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default AdminCourseLessons;
