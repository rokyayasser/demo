/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AdminContext } from "../../context/AdminContext";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Package,
  TrendingUp,
  Search,
  Filter,
  ArrowUpDown,
  Download,
} from "lucide-react";
import { toast } from "react-toastify";

const AdminProducts = () => {
  const navigate = useNavigate();
  const { aToken, backendUrl } = useContext(AdminContext);
  const { getAllProducts, formatPrice, calculateDiscountPercentage } =
    useContext(AdminContext);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/products/admin/all`, {
        headers: { token: aToken },
        params: { ...filters, search: searchTerm },
      });

      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("فشل في تحميل المنتجات");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;

    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/products/admin/${productId}`,
        { headers: { token: aToken } }
      );

      if (data.success) {
        toast.success("✅ تم حذف المنتج بنجاح");
        fetchProducts();
      }
    } catch (error) {
      toast.error("فشل في حذف المنتج: " + error.message);
    }
  };

  const togglePublishStatus = async (productId, currentStatus) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/products/admin/${productId}`,
        { isPublished: !currentStatus },
        { headers: { token: aToken } }
      );

      if (data.success) {
        toast.success(`✅ تم ${!currentStatus ? "نشر" : "إخفاء"} المنتج`);
        fetchProducts();
      }
    } catch (error) {
      toast.error("فشل في تغيير حالة المنتج: " + error.message);
    }
  };

  const toggleFeaturedStatus = async (productId, currentStatus) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/products/admin/${productId}`,
        { isFeatured: !currentStatus },
        { headers: { token: aToken } }
      );

      if (data.success) {
        toast.success(
          `✅ تم ${!currentStatus ? "تمييز" : "إلغاء تمييز"} المنتج`
        );
        fetchProducts();
      }
    } catch (error) {
      toast.error("فشل في تغيير حالة المنتج: " + error.message);
    }
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
              إدارة المنتجات
            </h1>
            <p className="text-textSoft">إدارة وتعديل منتجات المتجر</p>
          </div>
          <button
            onClick={() => navigate("/admin/products/create")}
            className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl font-bold hover:from-secondary hover:to-primary transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            إضافة منتج جديد
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-borderLight">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-textSoft">إجمالي المنتجات</p>
                <p className="text-2xl font-bold mt-2">150</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Package className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-borderLight">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-textSoft">المنتجات المنشورة</p>
                <p className="text-2xl font-bold mt-2">120</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Eye className="text-green-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-borderLight">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-textSoft">المنتجات المميزة</p>
                <p className="text-2xl font-bold mt-2">15</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Star className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-borderLight">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-textSoft">نفذت من المخزون</p>
                <p className="text-2xl font-bold mt-2">8</p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <TrendingUp className="text-red-600" size={24} />
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
                  placeholder="ابحث عن منتج بالاسم أو SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  dir="rtl"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters({ ...filters, sortBy: e.target.value })
                }
                className="px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="createdAt">أحدث المنتجات</option>
                <option value="price">السعر</option>
                <option value="name">الاسم</option>
                <option value="stock">المخزون</option>
              </select>
              <button
                onClick={() =>
                  setFilters({
                    ...filters,
                    sortOrder: filters.sortOrder === "desc" ? "asc" : "desc",
                  })
                }
                className="px-4 py-3 border border-borderLight rounded-xl hover:bg-gray-50 transition-colors"
              >
                <ArrowUpDown size={20} />
              </button>
              <button className="px-4 py-3 border border-borderLight rounded-xl hover:bg-gray-50 transition-colors">
                <Filter size={20} />
              </button>
              <button className="px-4 py-3 border border-borderLight rounded-xl hover:bg-gray-50 transition-colors">
                <Download size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
          <div className="w-24 h-24 mx-auto mb-6 bg-lightBg rounded-full flex items-center justify-center">
            <Package className="w-12 h-12 text-textSoft" />
          </div>
          <h3 className="text-2xl font-bold text-textMain mb-2">
            لا توجد منتجات
          </h3>
          <p className="text-textSoft mb-6">ابدأ بإضافة أول منتج للمتجر</p>
          <button
            onClick={() => navigate("/admin/products/create")}
            className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-secondary transition-colors"
          >
            إضافة أول منتج
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-borderLight">
                  <th className="py-4 px-6 text-right font-bold text-textMain">
                    المنتج
                  </th>
                  <th className="py-4 px-6 text-right font-bold text-textMain">
                    السعر
                  </th>
                  <th className="py-4 px-6 text-right font-bold text-textMain">
                    المخزون
                  </th>
                  <th className="py-4 px-6 text-right font-bold text-textMain">
                    الحالة
                  </th>
                  <th className="py-4 px-6 text-right font-bold text-textMain">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product._id}
                    className="border-b border-borderLight hover:bg-gray-50"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <img
                          src={product.mainImage}
                          alt={product.name_ar}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <h4 className="font-bold text-textMain">
                            {product.name_ar}
                          </h4>
                          <p className="text-sm text-textSoft">
                            SKU: {product.sku}
                          </p>
                          <div className="flex gap-2 mt-1">
                            {product.isFeatured && (
                              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                                مميز
                              </span>
                            )}
                            {product.discountPrice && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                                خصم{" "}
                                {calculateDiscountPercentage(
                                  product.price,
                                  product.discountPrice
                                )}
                                %
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        {product.discountPrice ? (
                          <>
                            <span className="font-bold text-red-600">
                              {formatPrice(product.discountPrice)}
                            </span>
                            <span className="text-sm text-textSoft line-through">
                              {formatPrice(product.price)}
                            </span>
                          </>
                        ) : (
                          <span className="font-bold">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          product.stock > 10
                            ? "bg-green-100 text-green-700"
                            : product.stock > 0
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {product.stock > 0
                          ? `${product.stock} قطعة`
                          : "نفذ من المخزون"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() =>
                            togglePublishStatus(
                              product._id,
                              product.isPublished
                            )
                          }
                          className={`px-3 py-1 rounded-lg text-xs font-bold ${
                            product.isPublished
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {product.isPublished ? "منشور" : "مخفي"}
                        </button>
                        <button
                          onClick={() =>
                            toggleFeaturedStatus(
                              product._id,
                              product.isFeatured
                            )
                          }
                          className={`px-3 py-1 rounded-lg text-xs font-bold ${
                            product.isFeatured
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {product.isFeatured ? "مميز" : "عادي"}
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            navigate(`/admin/products/edit/${product._id}`)
                          }
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          title="تعديل"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() =>
                            togglePublishStatus(
                              product._id,
                              product.isPublished
                            )
                          }
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                          title={product.isPublished ? "إخفاء" : "نشر"}
                        >
                          {product.isPublished ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
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
    </motion.div>
  );
};

export default AdminProducts;
