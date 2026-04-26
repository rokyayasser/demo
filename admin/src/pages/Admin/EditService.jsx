/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { AdminContext } from "../../context/AdminContext";
import adminService from "../../services/admin.service";
import { Upload, Plus, X, Image as ImageIcon } from "lucide-react";
import { SERVICE_CATEGORIES } from "../../utils/constants";

const EditService = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { updateService } = useContext(AdminContext);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    title_ar: "",
    category: "Endocrinology",
    category_ar: "الغدد الصماء",
    description: "",
    fees: "",
    duration: "30 minutes",
    features: [""],
    image: null,
    available: true,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);

  useEffect(() => {
    loadService();
  }, [serviceId]);

  const loadService = async () => {
    try {
      const data = await adminService.getServiceById(serviceId);
      const service = data.service;
      setFormData({
        title: service.title || "",
        title_ar: service.title_ar || "",
        category: service.category || "Endocrinology",
        category_ar: service.category_ar || "الغدد الصماء",
        description: service.description || "",
        fees: service.fees || "",
        duration: service.duration || "30 minutes",
        features: service.features?.length ? service.features : [""],
        image: null,
        available: service.available !== false,
      });
      setOriginalImage(service.image);
      setImagePreview(service.image);
    } catch (error) {
      console.error("Error loading service:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, ""],
    });
  };

  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  const updateFeature = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }
      formDataToSend.append("title", formData.title);
      formDataToSend.append("title_ar", formData.title_ar);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("category_ar", formData.category_ar);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("fees", formData.fees);
      formDataToSend.append("duration", formData.duration);
      formDataToSend.append("available", formData.available);
      formDataToSend.append(
        "features",
        JSON.stringify(formData.features.filter((f) => f.trim())),
      );

      const result = await updateService(serviceId, formDataToSend);
      if (result.success) {
        navigate("/admin/services-list");
      }
    } catch (error) {
      console.error("Error updating service:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">تعديل الخدمة</h1>
        <p className="text-gray-500 mb-8">تحديث معلومات الخدمة الطبية</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              صورة الخدمة
            </label>
            <div className="flex items-center gap-6">
              <div className="relative">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  اختر صورة جديدة لتغيير الصورة الحالية
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  اتركه فارغاً للاحتفاظ بالصورة الحالية
                </p>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                اسم الخدمة (English)
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                اسم الخدمة (عربي)
              </label>
              <input
                type="text"
                value={formData.title_ar}
                onChange={(e) =>
                  setFormData({ ...formData, title_ar: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                التخصص
              </label>
              <select
                value={formData.category}
                onChange={(e) => {
                  const selected = SERVICE_CATEGORIES.find(
                    (c) => c.en === e.target.value,
                  );
                  setFormData({
                    ...formData,
                    category: e.target.value,
                    category_ar: selected?.ar || "",
                  });
                }}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                required
              >
                {SERVICE_CATEGORIES.map((cat) => (
                  <option key={cat.en} value={cat.en}>
                    {cat.ar} - {cat.en}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                السعر (جنيه)
              </label>
              <input
                type="number"
                value={formData.fees}
                onChange={(e) =>
                  setFormData({ ...formData, fees: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              الوصف
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows="4"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>

          {/* Features */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-gray-700 font-medium">
                المميزات
              </label>
              <button
                type="button"
                onClick={addFeature}
                className="flex items-center gap-1 text-primary hover:text-secondary transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">إضافة ميزة</span>
              </button>
            </div>
            <div className="space-y-3">
              <AnimatePresence>
                {formData.features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      placeholder={`الميزة ${index + 1}`}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    {formData.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="px-3 text-red-500 hover:text-red-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Availability Toggle */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.available}
                onChange={(e) =>
                  setFormData({ ...formData, available: e.target.checked })
                }
                className="w-5 h-5 text-primary rounded focus:ring-primary"
              />
              <span className="text-gray-700 font-medium">
                الخدمة متاحة للحجز
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-xl font-bold hover:from-secondary hover:to-primary transition-all disabled:opacity-70"
            >
              {submitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جاري الحفظ...</span>
                </div>
              ) : (
                "حفظ التغييرات"
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/services-list")}
              className="px-8 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default EditService;
