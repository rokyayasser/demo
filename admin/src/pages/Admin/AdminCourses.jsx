/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from "react";
import { AdminContext } from "../../context/AdminContext";
import { motion } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Users,
  BookOpen,
  Clock,
  DollarSign,
  Filter,
  Search,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminCourses = () => {
  const { aToken, backendUrl } = useContext(AdminContext);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    title_ar: "",
    description: "",
    description_ar: "",
    category: "",
    category_ar: "",
    instructor: "",
    instructor_ar: "",
    instructorBio: "",
    instructorBio_ar: "",
    price: "",
    discountPrice: "",
    level: "مبتدئ",
    language: "العربية",
    isPublished: false,
    isFeatured: false,
    features: [],
    requirements: [],
    whatYouWillLearn: [],
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [promotionalVideo, setPromotionalVideo] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/courses`, {
        headers: { token: aToken },
      });

      if (response.data.success) {
        setCourses(response.data.courses || []);
      }
    } catch (error) {
      toast.error("فشل في تحميل الدورات");
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Debug: Log form data
      console.log("Form Data:", formData);
      console.log("Thumbnail:", thumbnail);
      console.log("Promotional Video:", promotionalVideo);

      const formDataToSend = new FormData();

      // Add all form data
      Object.keys(formData).forEach((key) => {
        if (
          key === "features" ||
          key === "requirements" ||
          key === "whatYouWillLearn"
        ) {
          // Convert array to JSON string
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Debug: Log what's being sent
      console.log("Sending form data...");
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }

      // Add files
      if (thumbnail) {
        formDataToSend.append("thumbnail", thumbnail);
      }
      if (promotionalVideo) {
        formDataToSend.append("promotionalVideo", promotionalVideo);
      }

      const response = await axios.post(
        `${backendUrl}/api/courses/admin/create`,
        formDataToSend,
        {
          headers: {
            token: aToken,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Server Response:", response.data);

      if (response.data.success) {
        toast.success("تم إنشاء الدورة بنجاح");
        setShowAddModal(false);
        resetForm();
        fetchCourses();
      } else {
        toast.error(response.data.message || "حدث خطأ");
      }
    } catch (error) {
      console.error("Error adding course:", error);
      console.error("Error details:", error.response?.data);

      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "فشل في إنشاء الدورة"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const formDataToSend = new FormData();

      // إضافة البيانات النصية
      Object.keys(formData).forEach((key) => {
        if (
          key === "features" ||
          key === "requirements" ||
          key === "whatYouWillLearn"
        ) {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // إضافة الملفات
      if (thumbnail) {
        formDataToSend.append("thumbnail", thumbnail);
      }

      const response = await axios.put(
        `${backendUrl}/api/courses/admin/${selectedCourse._id}`,
        formDataToSend,
        {
          headers: {
            token: aToken,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("تم تحديث الدورة بنجاح");
        setShowEditModal(false);
        resetForm();
        fetchCourses();
      }
    } catch (error) {
      toast.error("فشل في تحديث الدورة");
      console.error("Error updating course:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه الدورة؟")) return;

    try {
      setLoading(true);
      const response = await axios.delete(
        `${backendUrl}/api/courses/admin/${courseId}`,
        { headers: { token: aToken } }
      );

      if (response.data.success) {
        toast.success("تم حذف الدورة بنجاح");
        fetchCourses();
      }
    } catch (error) {
      toast.error("فشل في حذف الدورة");
      console.error("Error deleting course:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToggle = async (courseId, currentStatus) => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/courses/admin/${courseId}`,
        { isPublished: !currentStatus },
        { headers: { token: aToken } }
      );

      if (response.data.success) {
        toast.success(`تم ${!currentStatus ? "نشر" : "إخفاء"} الدورة`);
        fetchCourses();
      }
    } catch (error) {
      toast.error("فشل في تغيير حالة الدورة");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      title_ar: "",
      description: "",
      description_ar: "",
      category: "",
      category_ar: "",
      instructor: "",
      instructor_ar: "",
      instructorBio: "",
      instructorBio_ar: "",
      price: "",
      discountPrice: "",
      level: "مبتدئ",
      language: "العربية",
      isPublished: false,
      isFeatured: false,
      features: [],
      requirements: [],
      whatYouWillLearn: [],
    });
    setThumbnail(null);
    setPromotionalVideo(null);
  };

  const openEditModal = (course) => {
    setSelectedCourse(course);
    setFormData({
      title: course.title || "",
      title_ar: course.title_ar || "",
      description: course.description || "",
      description_ar: course.description_ar || "",
      category: course.category || "",
      category_ar: course.category_ar || "",
      instructor: course.instructor || "",
      instructor_ar: course.instructor_ar || "",
      instructorBio: course.instructorBio || "",
      instructorBio_ar: course.instructorBio_ar || "",
      price: course.price || "",
      discountPrice: course.discountPrice || "",
      level: course.level || "مبتدئ",
      language: course.language || "العربية",
      isPublished: course.isPublished || false,
      isFeatured: course.isFeatured || false,
      features: course.features || [],
      requirements: course.requirements || [],
      whatYouWillLearn: course.whatYouWillLearn || [],
    });
    setShowEditModal(true);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleManageLessons = (courseId) => {
    navigate(`/admin/courses/${courseId}/lessons`);
  };

  const filteredCourses = courses.filter((course) => {
    if (!course) return false;

    const matchesSearch =
      searchTerm === "" ||
      (course.title_ar &&
        course.title_ar.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (course.title &&
        course.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (course.category &&
        course.category.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "published" && course.isPublished) ||
      (filterStatus === "unpublished" && !course.isPublished) ||
      (filterStatus === "featured" && course.isFeatured);

    return matchesSearch && matchesFilter;
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat("ar-EG").format(price || 0);
  };

  // زر إضافة مخفي لتنشيط من السايدبار
  useEffect(() => {
    const handleAddCourseClick = () => {
      openAddModal();
    };

    const addButton = document.getElementById("add-course-btn");
    if (addButton) {
      addButton.addEventListener("click", handleAddCourseClick);
    }

    return () => {
      if (addButton) {
        addButton.removeEventListener("click", handleAddCourseClick);
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-7xl mx-auto p-4 sm:p-6"
      dir="rtl"
    >
      {/* زر إضافة مخفي للسايدبار */}
      <button id="add-course-btn" className="hidden"></button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              إدارة الدورات
            </h1>
            <p className="text-textSoft">إدارة وتعديل جميع الدورات التدريبية</p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl font-bold hover:from-secondary hover:to-primary transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            إضافة دورة جديدة
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-borderLight">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="ابحث عن دورة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                dir="rtl"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-borderLight rounded-xl bg-white"
                dir="rtl"
              >
                <option value="all">جميع الدورات</option>
                <option value="published">منشورة</option>
                <option value="unpublished">غير منشورة</option>
                <option value="featured">مميزة</option>
              </select>
              <button className="px-4 py-3 border border-borderLight rounded-xl hover:bg-gray-50 flex items-center gap-2">
                <Filter size={20} />
                <span>المزيد</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
          <div className="w-24 h-24 mx-auto mb-6 bg-lightBg rounded-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-textSoft" />
          </div>
          <h3 className="text-2xl font-bold text-textMain mb-2">
            لا توجد دورات
          </h3>
          <p className="text-textSoft mb-6">
            {searchTerm
              ? "لم يتم العثور على دورات تطابق بحثك"
              : "لم يتم إضافة أي دورات بعد"}
          </p>
          <button
            onClick={openAddModal}
            className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-secondary transition-colors"
          >
            إضافة أول دورة
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course._id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-borderLight hover:shadow-xl transition-all duration-300"
            >
              {/* Course Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={
                    course.thumbnail || "https://via.placeholder.com/400x300"
                  }
                  alt={course.title_ar || "دورة"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  {course.category || "غير مصنف"}
                </div>
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {course.isFeatured && (
                    <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      مميز
                    </span>
                  )}
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold shadow-lg ${
                      course.isPublished
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {course.isPublished ? "منشور" : "مخفي"}
                  </span>
                </div>
              </div>

              {/* Course Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-textMain line-clamp-1">
                    {course.title_ar || "بدون عنوان"}
                  </h3>
                  <div
                    className={`px-2 py-1 rounded-full text-xs ${
                      course.level === "مبتدئ"
                        ? "bg-green-100 text-green-700"
                        : course.level === "متوسط"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {course.level || "غير محدد"}
                  </div>
                </div>

                <p className="text-textSoft text-sm mb-4 line-clamp-2">
                  {course.description_ar || "لا يوجد وصف"}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between mb-6 text-sm text-textSoft">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Users size={16} />
                      <span>{course.studentsEnrolled || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star
                        size={16}
                        className="text-yellow-400 fill-current"
                      />
                      <span>{course.rating?.toFixed(1) || "0.0"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{course.totalLessons || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 font-bold">
                    <DollarSign size={16} />
                    <span className="text-primary">
                      {formatPrice(course.price)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleManageLessons(course._id)}
                    className="flex-1 py-2 bg-blue-100 text-blue-600 rounded-xl font-medium hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <BookOpen size={16} />
                    الدروس
                  </button>
                  <button
                    onClick={() =>
                      handlePublishToggle(course._id, course.isPublished)
                    }
                    className={`flex-1 py-2 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                      course.isPublished
                        ? "bg-red-100 text-red-600 hover:bg-red-200"
                        : "bg-green-100 text-green-600 hover:bg-green-200"
                    }`}
                  >
                    {course.isPublished ? (
                      <>
                        <EyeOff size={16} />
                        إخفاء
                      </>
                    ) : (
                      <>
                        <Eye size={16} />
                        نشر
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => openEditModal(course)}
                    className="px-4 py-2 bg-yellow-100 text-yellow-600 rounded-xl font-medium hover:bg-yellow-200 transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course._id)}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-xl font-medium hover:bg-red-200 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-primary">
                  إضافة دورة جديدة
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <form onSubmit={handleAddCourse}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-textMain mb-2">
                        عنوان الدورة (الإنجليزية) *
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
                        عنوان الدورة (العربية) *
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
                    <div>
                      <label className="block text-sm font-medium text-textMain mb-2">
                        الوصف (الإنجليزية) *
                      </label>
                      <textarea
                        required
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
                    <div>
                      <label className="block text-sm font-medium text-textMain mb-2">
                        الوصف (العربية) *
                      </label>
                      <textarea
                        required
                        value={formData.description_ar}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description_ar: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  {/* Category and Instructor */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-textMain mb-2">
                          التصنيف (الإنجليزية) *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.category}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              category: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-textMain mb-2">
                          التصنيف (العربية) *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.category_ar}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              category_ar: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                          dir="rtl"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-textMain mb-2">
                          المدرب (الإنجليزية) *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.instructor}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              instructor: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-textMain mb-2">
                          المدرب (العربية) *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.instructor_ar}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              instructor_ar: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                          dir="rtl"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-textMain mb-2">
                        السعر (جنيه) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-textMain mb-2">
                        السعر بعد الخصم (اختياري)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.discountPrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            discountPrice: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Level and Language */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-textMain mb-2">
                      المستوى
                    </label>
                    <select
                      value={formData.level}
                      onChange={(e) =>
                        setFormData({ ...formData, level: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      dir="rtl"
                    >
                      <option value="مبتدئ">مبتدئ</option>
                      <option value="متوسط">متوسط</option>
                      <option value="متقدم">متقدم</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-textMain mb-2">
                      اللغة
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) =>
                        setFormData({ ...formData, language: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      dir="rtl"
                    >
                      <option value="العربية">العربية</option>
                      <option value="الإنجليزية">الإنجليزية</option>
                      <option value="مختلط">مختلط</option>
                    </select>
                  </div>
                </div>

                {/* Features and Requirements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-textMain mb-2">
                      المميزات (واحدة في كل سطر)
                    </label>
                    <textarea
                      value={formData.features.join("\n")}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          features: e.target.value.split("\n"),
                        })
                      }
                      rows={4}
                      className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="ميزة 1
ميزة 2
ميزة 3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-textMain mb-2">
                      المتطلبات (واحدة في كل سطر)
                    </label>
                    <textarea
                      value={formData.requirements.join("\n")}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          requirements: e.target.value.split("\n"),
                        })
                      }
                      rows={4}
                      className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="متطلب 1
متطلب 2
متطلب 3"
                    />
                  </div>
                </div>

                {/* What You Will Learn */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-textMain mb-2">
                    ماذا سوف تتعلم؟ (واحدة في كل سطر)
                  </label>
                  <textarea
                    value={formData.whatYouWillLearn.join("\n")}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        whatYouWillLearn: e.target.value.split("\n"),
                      })
                    }
                    rows={4}
                    className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="سوف تتعلم 1
سوف تتعلم 2
سوف تتعلم 3"
                  />
                </div>

                {/* File Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-textMain mb-2">
                      الصورة المصغرة *
                    </label>
                    <div className="border-2 border-dashed border-borderLight rounded-xl p-6 text-center hover:border-primary transition-colors">
                      <Upload
                        className="mx-auto mb-3 text-textSoft"
                        size={24}
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setThumbnail(e.target.files[0])}
                        className="hidden"
                        id="thumbnail-upload"
                        required
                      />
                      <label
                        htmlFor="thumbnail-upload"
                        className="cursor-pointer text-primary font-medium hover:text-secondary"
                      >
                        {thumbnail ? thumbnail.name : "اختر صورة مصغرة"}
                      </label>
                      <p className="text-sm text-textSoft mt-2">
                        JPEG, PNG, WebP - الحد الأقصى 5MB
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-textMain mb-2">
                      فيديو ترويجي (اختياري)
                    </label>
                    <div className="border-2 border-dashed border-borderLight rounded-xl p-6 text-center hover:border-primary transition-colors">
                      <Upload
                        className="mx-auto mb-3 text-textSoft"
                        size={24}
                      />
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => setPromotionalVideo(e.target.files[0])}
                        className="hidden"
                        id="video-upload"
                      />
                      <label
                        htmlFor="video-upload"
                        className="cursor-pointer text-primary font-medium hover:text-secondary"
                      >
                        {promotionalVideo
                          ? promotionalVideo.name
                          : "اختر فيديو ترويجي"}
                      </label>
                      <p className="text-sm text-textSoft mt-2">
                        MP4, MOV, AVI - الحد الأقصى 100MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="flex gap-6 mb-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isPublished: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-primary rounded focus:ring-primary"
                    />
                    <span className="text-textMain">نشر الدورة</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isFeatured: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-primary rounded focus:ring-primary"
                    />
                    <span className="text-textMain">تعيين كمميزة</span>
                  </label>
                </div>

                {/* Action Buttons */}
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
                    {loading ? "جاري الحفظ..." : "إضافة الدورة"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Course Modal */}
      {showEditModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-primary">
                  تعديل الدورة
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <form onSubmit={handleUpdateCourse}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-textMain mb-2">
                        عنوان الدورة (الإنجليزية) *
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
                        عنوان الدورة (العربية) *
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
                    <div>
                      <label className="block text-sm font-medium text-textMain mb-2">
                        الوصف (الإنجليزية) *
                      </label>
                      <textarea
                        required
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
                    <div>
                      <label className="block text-sm font-medium text-textMain mb-2">
                        الوصف (العربية) *
                      </label>
                      <textarea
                        required
                        value={formData.description_ar}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description_ar: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  {/* Category and Instructor */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-textMain mb-2">
                          التصنيف (الإنجليزية) *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.category}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              category: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-textMain mb-2">
                          التصنيف (العربية) *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.category_ar}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              category_ar: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                          dir="rtl"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-textMain mb-2">
                          المدرب (الإنجليزية) *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.instructor}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              instructor: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-textMain mb-2">
                          المدرب (العربية) *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.instructor_ar}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              instructor_ar: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                          dir="rtl"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-textMain mb-2">
                        السعر (جنيه) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-textMain mb-2">
                        السعر بعد الخصم (اختياري)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.discountPrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            discountPrice: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Level and Language */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-textMain mb-2">
                      المستوى
                    </label>
                    <select
                      value={formData.level}
                      onChange={(e) =>
                        setFormData({ ...formData, level: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      dir="rtl"
                    >
                      <option value="مبتدئ">مبتدئ</option>
                      <option value="متوسط">متوسط</option>
                      <option value="متقدم">متقدم</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-textMain mb-2">
                      اللغة
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) =>
                        setFormData({ ...formData, language: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      dir="rtl"
                    >
                      <option value="العربية">العربية</option>
                      <option value="الإنجليزية">الإنجليزية</option>
                      <option value="مختلط">مختلط</option>
                    </select>
                  </div>
                </div>

                {/* إظهار الصورة الحالية */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-textMain mb-2">
                    الصورة المصغرة الحالية
                  </label>
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        selectedCourse.thumbnail ||
                        "https://via.placeholder.com/150"
                      }
                      alt="Current thumbnail"
                      className="w-24 h-24 object-cover rounded-xl"
                    />
                    <div>
                      <p className="text-sm text-textSoft">تغيير الصورة:</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setThumbnail(e.target.files[0])}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-borderLight">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-3 border border-borderLight rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold hover:from-secondary hover:to-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "جاري التحديث..." : "تحديث الدورة"}
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

export default AdminCourses;
