/* eslint-disable no-unused-vars */
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AdminContext } from "../../context/AdminContext";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, X, Plus, Minus, Save } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

const AdminCreateProduct = () => {
  const navigate = useNavigate();
  const { aToken, backendUrl } = useContext(AdminContext);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    name_ar: "",
    description: "",
    description_ar: "",
    category: "",
    category_ar: "",
    subcategory: "",
    subcategory_ar: "",
    price: "",
    discountPrice: "",
    stock: "",
    sku: "",
    brand: "",
    brand_ar: "",
    tags: "",
    specifications: JSON.stringify({}),
    isPublished: true,
    isFeatured: false,
  });
  const [images, setImages] = useState([]);
  const [specifications, setSpecifications] = useState([]);

  const categories = [
    { value: "electronics", label: "Electronics", label_ar: "إلكترونيات" },
    { value: "clothing", label: "Clothing", label_ar: "ملابس" },
    { value: "home", label: "Home & Garden", label_ar: "المنزل والحديقة" },
    { value: "beauty", label: "Beauty", label_ar: "الجمال" },
    { value: "sports", label: "Sports", label_ar: "رياضة" },
    { value: "books", label: "Books", label_ar: "كتب" },
  ];

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 10) {
      toast.error("الحد الأقصى للصور هو 10 صور");
      return;
    }

    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages([...images, ...newImages]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const addSpecification = () => {
    setSpecifications([...specifications, { key: "", value: "" }]);
  };

  const updateSpecification = (index, field, value) => {
    const newSpecs = [...specifications];
    newSpecs[index][field] = value;
    setSpecifications(newSpecs);

    // Update specifications JSON
    const specsObj = {};
    newSpecs.forEach((spec) => {
      if (spec.key && spec.value) {
        specsObj[spec.key] = spec.value;
      }
    });
    setFormData({ ...formData, specifications: JSON.stringify(specsObj) });
  };

  const removeSpecification = (index) => {
    const newSpecs = [...specifications];
    newSpecs.splice(index, 1);
    setSpecifications(newSpecs);

    const specsObj = {};
    newSpecs.forEach((spec) => {
      if (spec.key && spec.value) {
        specsObj[spec.key] = spec.value;
      }
    });
    setFormData({ ...formData, specifications: JSON.stringify(specsObj) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formDataToSend = new FormData();

      // Add form data
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      // Add images
      images.forEach((image) => {
        formDataToSend.append("images", image.file);
      });

      const { data } = await axios.post(
        `${backendUrl}/api/products/admin/create`,
        formDataToSend,
        {
          headers: {
            token: aToken,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        toast.success("✅ تم إنشاء المنتج بنجاح");
        navigate("/admin/products");
      } else {
        toast.error("❌ " + (data.message || "حدث خطأ"));
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("❌ فشل في إنشاء المنتج: " + error.message);
    } finally {
      setLoading(false);
    }
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
              onClick={() => navigate("/admin/products")}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">
                إضافة منتج جديد
              </h1>
              <p className="text-textSoft">أدخل تفاصيل المنتج الجديد</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-primary mb-6">
            المعلومات الأساسية
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-textMain mb-2">
                اسم المنتج (الإنجليزية) *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Product Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-textMain mb-2">
                اسم المنتج (العربية) *
              </label>
              <input
                type="text"
                required
                value={formData.name_ar}
                onChange={(e) =>
                  setFormData({ ...formData, name_ar: e.target.value })
                }
                className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="اسم المنتج"
                dir="rtl"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-textMain mb-2">
                وصف المنتج (الإنجليزية) *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Product description..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-textMain mb-2">
                وصف المنتج (العربية) *
              </label>
              <textarea
                required
                value={formData.description_ar}
                onChange={(e) =>
                  setFormData({ ...formData, description_ar: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="وصف المنتج..."
                dir="rtl"
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-primary mb-6">التصنيفات</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-textMain mb-2">
                التصنيف الرئيسي *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">اختر تصنيف</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label_ar}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-textMain mb-2">
                التصنيف الرئيسي (الإنجليزية)
              </label>
              <input
                type="text"
                value={formData.category_ar}
                onChange={(e) =>
                  setFormData({ ...formData, category_ar: e.target.value })
                }
                className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Category in English"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-textMain mb-2">
                التصنيف الفرعي
              </label>
              <input
                type="text"
                value={formData.subcategory}
                onChange={(e) =>
                  setFormData({ ...formData, subcategory: e.target.value })
                }
                className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Subcategory"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-textMain mb-2">
                التصنيف الفرعي (العربية)
              </label>
              <input
                type="text"
                value={formData.subcategory_ar}
                onChange={(e) =>
                  setFormData({ ...formData, subcategory_ar: e.target.value })
                }
                className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="التصنيف الفرعي"
                dir="rtl"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-primary mb-6">
            التسعير والمخزون
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-textMain mb-2">
                السعر (جنيه) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-textMain mb-2">
                سعر الخصم (جنيه)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.discountPrice}
                onChange={(e) =>
                  setFormData({ ...formData, discountPrice: e.target.value })
                }
                className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-textMain mb-2">
                المخزون *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-textMain mb-2">
                رمز المنتج (SKU) *
              </label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="PROD-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-textMain mb-2">
                الماركة (الإنجليزية)
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
                className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Brand Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-textMain mb-2">
                الماركة (العربية)
              </label>
              <input
                type="text"
                value={formData.brand_ar}
                onChange={(e) =>
                  setFormData({ ...formData, brand_ar: e.target.value })
                }
                className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="اسم الماركة"
                dir="rtl"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-primary mb-6">صور المنتج</h2>

          <div className="mb-6">
            <div className="border-2 border-dashed border-borderLight rounded-xl p-6 text-center hover:border-primary transition-colors">
              <Upload className="mx-auto mb-4 text-textSoft" size={40} />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="product-images-upload"
                multiple
              />
              <label
                htmlFor="product-images-upload"
                className="cursor-pointer text-primary font-medium hover:text-secondary text-lg"
              >
                رفع صور المنتج
              </label>
              <p className="text-sm text-textSoft mt-2">
                JPEG, PNG - الحد الأقصى 10 صور، الحجم الأقصى 5MB لكل صورة
              </p>
              <p className="text-xs text-textSoft mt-1">
                الصورة الأولى ستكون الصورة الرئيسية
              </p>
            </div>
          </div>

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image.preview}
                    alt={`Product ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  {index === 0 && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      رئيسية
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 left-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Specifications */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-primary">المواصفات</h2>
            <button
              type="button"
              onClick={addSpecification}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-secondary transition-colors"
            >
              <Plus size={20} />
              إضافة مواصفة
            </button>
          </div>

          {specifications.length === 0 ? (
            <p className="text-center text-textSoft py-4">
              لا توجد مواصفات مضافة
            </p>
          ) : (
            <div className="space-y-4">
              {specifications.map((spec, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <input
                    type="text"
                    value={spec.key}
                    onChange={(e) =>
                      updateSpecification(index, "key", e.target.value)
                    }
                    placeholder="المفتاح (مثال: اللون)"
                    className="flex-1 px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    dir="rtl"
                  />
                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) =>
                      updateSpecification(index, "value", e.target.value)
                    }
                    placeholder="القيمة (مثال: أحمر)"
                    className="flex-1 px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    dir="rtl"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpecification(index)}
                    className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
                  >
                    <Minus size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tags & Settings */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-primary mb-6">الإعدادات</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-textMain mb-2">
                الوسوم
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="وسم1, وسم2, وسم3"
                dir="rtl"
              />
              <p className="text-xs text-textSoft mt-2">افصل الوسوم بفاصلة</p>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublished: e.target.checked })
                  }
                  className="w-5 h-5 text-primary rounded focus:ring-primary"
                />
                <span className="text-textMain">نشر المنتج فوراً</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) =>
                    setFormData({ ...formData, isFeatured: e.target.checked })
                  }
                  className="w-5 h-5 text-primary rounded focus:ring-primary"
                />
                <span className="text-textMain">تمييز المنتج</span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="flex-1 py-4 border border-borderLight rounded-xl hover:bg-gray-50 transition-colors text-lg font-medium"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold hover:from-secondary hover:to-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                  جاري الحفظ...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Save size={24} />
                  حفظ المنتج
                </span>
              )}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default AdminCreateProduct;
