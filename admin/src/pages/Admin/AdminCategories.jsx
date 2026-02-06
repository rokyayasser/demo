/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from "react";
import { AdminContext } from "../../context/AdminContext";
import { motion } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Layers,
  Search,
  Filter,
  ArrowUpDown,
  Package,
} from "lucide-react";
import { toast } from "react-toastify";

const AdminCategories = () => {
  const {
    aToken,
    backendUrl,
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useContext(AdminContext);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    name_ar: "",
    description: "",
    description_ar: "",
    image: "",
    isActive: true,
    parentCategory: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // Use the context function instead of directly calling axios
      const result = await getAllCategories();
      if (result.categories) {
        setCategories(result.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("فشل في تحميل التصنيفات");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let result;
      if (selectedCategory) {
        result = await updateCategory(selectedCategory._id, formData);
      } else {
        result = await createCategory(formData);
      }

      if (result.success) {
        toast.success(
          selectedCategory ? "✅ تم تحديث التصنيف" : "✅ تم إنشاء التصنيف"
        );
        setShowAddModal(false);
        setShowEditModal(false);
        setSelectedCategory(null);
        setFormData({
          name: "",
          name_ar: "",
          description: "",
          description_ar: "",
          image: "",
          isActive: true,
          parentCategory: "",
        });
        fetchCategories();
      }
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("فشل في حفظ التصنيف");
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا التصنيف؟")) return;

    try {
      const result = await deleteCategory(categoryId);
      if (result.success) {
        toast.success("✅ تم حذف التصنيف");
        fetchCategories();
      }
    } catch (error) {
      toast.error("فشل في حذف التصنيف: " + error.message);
    }
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name || "",
      name_ar: category.name_ar || "",
      description: category.description || "",
      description_ar: category.description_ar || "",
      image: category.image || "",
      isActive: category.isActive !== false,
      parentCategory: category.parentCategory || "",
    });
    setShowEditModal(true);
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-7xl mx-auto p-4 sm:p-6"
      dir="rtl"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              إدارة التصنيفات
            </h1>
            <p className="text-textSoft">إدارة وتعديل تصنيفات المنتجات</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl font-bold hover:from-secondary hover:to-primary transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            إضافة تصنيف جديد
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-borderLight">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-textSoft">إجمالي التصنيفات</p>
                <p className="text-2xl font-bold mt-2">{categories.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Layers className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-borderLight">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-textSoft">التصنيفات النشطة</p>
                <p className="text-2xl font-bold mt-2">
                  {categories.filter((c) => c.isActive !== false).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Layers className="text-green-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-borderLight">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-textSoft">تصنيفات رئيسية</p>
                <p className="text-2xl font-bold mt-2">
                  {categories.filter((c) => !c.parentCategory).length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Package className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-textSoft"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="ابحث عن تصنيف..."
                  className="w-full pr-10 pl-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  dir="rtl"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select className="px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent">
                <option value="">جميع الحالات</option>
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
              </select>
              <button className="px-4 py-3 border border-borderLight rounded-xl hover:bg-gray-50 transition-colors">
                <Filter size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
          <div className="w-24 h-24 mx-auto mb-6 bg-lightBg rounded-full flex items-center justify-center">
            <Layers className="w-12 h-12 text-textSoft" />
          </div>
          <h3 className="text-2xl font-bold text-textMain mb-2">
            لا توجد تصنيفات
          </h3>
          <p className="text-textSoft mb-6">ابدأ بإضافة أول تصنيف للمنتجات</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-secondary transition-colors"
          >
            إضافة أول تصنيف
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-borderLight">
                  <th className="py-4 px-6 text-right font-bold text-textMain">
                    التصنيف
                  </th>
                  <th className="py-4 px-6 text-right font-bold text-textMain">
                    المنتجات
                  </th>
                  <th className="py-4 px-6 text-right font-bold text-textMain">
                    الحالة
                  </th>
                  <th className="py-4 px-6 text-right font-bold text-textMain">
                    تاريخ الإنشاء
                  </th>
                  <th className="py-4 px-6 text-right font-bold text-textMain">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr
                    key={category._id}
                    className="border-b border-borderLight hover:bg-gray-50"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        {category.image && (
                          <img
                            src={category.image}
                            alt={category.name_ar}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <h4 className="font-bold text-textMain">
                            {category.name_ar}
                          </h4>
                          <p className="text-sm text-textSoft">
                            {category.name}
                          </p>
                          {category.parentCategory && (
                            <p className="text-xs text-textSoft">تصنيف فرعي</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                        {category.productCount || 0} منتج
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          category.isActive !== false
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {category.isActive !== false ? "نشط" : "غير نشط"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {category.createdAt
                        ? new Date(category.createdAt).toLocaleDateString(
                            "ar-EG"
                          )
                        : "-"}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          title="تعديل"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(category._id)}
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

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-primary">
                  إضافة تصنيف جديد
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-textMain mb-2">
                      اسم التصنيف (الإنجليزية)
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Category Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-textMain mb-2">
                      اسم التصنيف (العربية) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name_ar}
                      onChange={(e) =>
                        setFormData({ ...formData, name_ar: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="اسم التصنيف"
                      dir="rtl"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-textMain mb-2">
                      وصف التصنيف (العربية)
                    </label>
                    <textarea
                      value={formData.description_ar}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description_ar: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="وصف التصنيف..."
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-textMain mb-2">
                      صورة التصنيف (رابط)
                    </label>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-textMain mb-2">
                      التصنيف الرئيسي
                    </label>
                    <select
                      value={formData.parentCategory}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          parentCategory: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">تصنيف رئيسي</option>
                      {categories
                        .filter(
                          (c) =>
                            !c.parentCategory && c._id !== selectedCategory?._id
                        )
                        .map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name_ar}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-5 h-5 text-primary rounded focus:ring-primary"
                  />
                  <label htmlFor="isActive" className="text-textMain">
                    التصنيف نشط
                  </label>
                </div>

                <div className="flex gap-4 pt-6 border-t border-borderLight">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 border border-borderLight rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-secondary transition-colors"
                  >
                    حفظ التصنيف
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-primary">
                  تعديل التصنيف
                </h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedCategory(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Same form fields as Add Modal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-textMain mb-2">
                      اسم التصنيف (الإنجليزية)
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-textMain mb-2">
                      اسم التصنيف (العربية) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name_ar}
                      onChange={(e) =>
                        setFormData({ ...formData, name_ar: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      dir="rtl"
                    />
                  </div>

                  {/* Add other fields similarly */}
                </div>

                <div className="flex gap-4 pt-6 border-t border-borderLight">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedCategory(null);
                    }}
                    className="flex-1 py-3 border border-borderLight rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-secondary transition-colors"
                  >
                    تحديث التصنيف
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

export default AdminCategories;
