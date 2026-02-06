/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ProductContext } from "../../context/ProductContext";
import { AppContext } from "../../context/AppContext";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Grid,
  List,
  Star,
  ShoppingCart,
  Eye,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";

const ProductsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    products,
    categories,
    getAllProducts,
    addToCart,
    formatPrice,
    calculateDiscountPercentage,
    isLoading,
  } = useContext(ProductContext);
  const { token } = useContext(AppContext);

  const [viewMode, setViewMode] = useState("grid");
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sortBy: searchParams.get("sortBy") || "createdAt",
    sortOrder: searchParams.get("sortOrder") || "desc",
    search: searchParams.get("search") || "",
    page: parseInt(searchParams.get("page")) || 1,
    limit: 20,
  });

  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    loadProducts();
    // Update URL with current filters
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
  }, [filters]);

  const loadProducts = async () => {
    await getAllProducts(filters);
  };

  const handleAddToCart = async (productId) => {
    if (!token) {
      toast.info("يجب تسجيل الدخول أولاً لإضافة المنتج إلى السلة");
      navigate("/login", { state: { from: "/products" } });
      return;
    }

    const result = await addToCart(productId);
    if (result) {
      toast.success("تمت إضافة المنتج إلى السلة");
    }
  };

  const handleAddToWishlist = (productId) => {
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter((id) => id !== productId));
      toast.success("تم إزالة المنتج من المفضلة");
    } else {
      setWishlist([...wishlist, productId]);
      toast.success("تم إضافة المنتج إلى المفضلة");
    }
  };

  const handleQuickView = (productId) => {
    // Implement quick view modal
    console.log("Quick view:", productId);
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
    window.scrollTo(0, 0);
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "createdAt",
      sortOrder: "desc",
      search: "",
      page: 1,
      limit: 20,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold mb-4">متجرنا</h1>
          <p className="text-xl mb-6 text-white/90">
            اكتشف أفضل المنتجات بأسعار تنافسية
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl">
            <div className="relative">
              <Search
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70"
                size={24}
              />
              <input
                type="text"
                placeholder="ابحث عن منتج..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pr-12 pl-4 py-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30"
                dir="rtl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div
            className={`lg:w-1/4 ${showFilters ? "block" : "hidden lg:block"}`}
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-primary">الفلاتر</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary hover:text-secondary"
                >
                  مسح الكل
                </button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-bold text-textMain mb-3">التصنيفات</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={!filters.category}
                      onChange={() => handleFilterChange("category", "")}
                      className="w-4 h-4 text-primary"
                    />
                    <span>الكل</span>
                  </label>
                  {categories.slice(0, 5).map((cat) => (
                    <label
                      key={cat._id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="category"
                        checked={filters.category === cat._id}
                        onChange={() => handleFilterChange("category", cat._id)}
                        className="w-4 h-4 text-primary"
                      />
                      <span>{cat.category_ar}</span>
                      <span className="text-xs text-textSoft">
                        ({cat.count})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-bold text-textMain mb-3">نطاق السعر</h3>
                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder="من"
                    value={filters.minPrice}
                    onChange={(e) =>
                      handleFilterChange("minPrice", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-borderLight rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="إلى"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      handleFilterChange("maxPrice", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-borderLight rounded-lg"
                  />
                </div>
              </div>

              {/* Sort Options */}
              <div className="mb-6">
                <h3 className="font-bold text-textMain mb-3">ترتيب حسب</h3>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className="w-full px-3 py-2 border border-borderLight rounded-lg"
                >
                  <option value="createdAt">الأحدث</option>
                  <option value="price">السعر</option>
                  <option value="averageRating">التقييم</option>
                  <option value="popular">الأكثر مبيعاً</option>
                </select>
              </div>

              <button
                onClick={() => setShowFilters(false)}
                className="lg:hidden w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-secondary transition-colors"
              >
                تطبيق الفلاتر
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:w-3/4">
            {/* Toolbar */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 border border-borderLight rounded-xl hover:bg-gray-50"
                  >
                    <Filter size={20} />
                    الفلاتر
                  </button>
                  <p className="text-textMain">
                    عرض <span className="font-bold">{products.length}</span>{" "}
                    منتج
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-lg ${
                        viewMode === "grid"
                          ? "bg-primary text-white"
                          : "bg-gray-100"
                      }`}
                    >
                      <Grid size={20} />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-lg ${
                        viewMode === "list"
                          ? "bg-primary text-white"
                          : "bg-gray-100"
                      }`}
                    >
                      <List size={20} />
                    </button>
                  </div>

                  <select
                    value={filters.sortOrder}
                    onChange={(e) =>
                      handleFilterChange("sortOrder", e.target.value)
                    }
                    className="px-3 py-2 border border-borderLight rounded-lg"
                  >
                    <option value="desc">تنازلي</option>
                    <option value="asc">تصاعدي</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl shadow-lg p-4 animate-pulse"
                  >
                    <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-textMain mb-2">
                  لا توجد منتجات
                </h3>
                <p className="text-textSoft mb-6">
                  لم نعثر على منتجات تطابق بحثك
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-secondary transition-colors"
                >
                  مسح الفلاتر
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden group"
                  >
                    {/* Product Image */}
                    <div className="relative overflow-hidden">
                      <img
                        src={product.mainImage}
                        alt={product.name_ar}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      />

                      {/* Badges */}
                      <div className="absolute top-3 left-3 space-y-2">
                        {product.discountPrice && (
                          <span className="block px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                            خصم{" "}
                            {calculateDiscountPercentage(
                              product.price,
                              product.discountPrice
                            )}
                            %
                          </span>
                        )}
                        {product.isFeatured && (
                          <span className="block px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded">
                            مميز
                          </span>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="absolute top-3 right-3 space-y-2">
                        <button
                          onClick={() => handleAddToWishlist(product._id)}
                          className={`p-2 rounded-full backdrop-blur-sm ${
                            wishlist.includes(product._id)
                              ? "bg-red-500 text-white"
                              : "bg-white/90 text-gray-700 hover:bg-white"
                          }`}
                        >
                          <Heart
                            size={18}
                            className={
                              wishlist.includes(product._id)
                                ? "fill-current"
                                : ""
                            }
                          />
                        </button>
                        <button
                          onClick={() => handleQuickView(product._id)}
                          className="p-2 rounded-full bg-white/90 text-gray-700 hover:bg-white"
                        >
                          <Eye size={18} />
                        </button>
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => handleAddToCart(product._id)}
                        className="absolute bottom-0 left-0 right-0 bg-primary text-white py-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 font-bold"
                      >
                        أضف إلى السلة
                      </button>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3
                        onClick={() => navigate(`/products/${product._id}`)}
                        className="font-bold text-textMain mb-2 hover:text-primary cursor-pointer line-clamp-2"
                      >
                        {product.name_ar}
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            className={`${
                              star <= (product.averageRating || 0)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-xs text-textSoft mr-1">
                          ({product.averageRating?.toFixed(1) || 0})
                        </span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <div>
                          {product.discountPrice ? (
                            <>
                              <span className="font-bold text-red-600 text-lg">
                                {formatPrice(product.discountPrice)}
                              </span>
                              <span className="text-sm text-textSoft line-through mr-2">
                                {formatPrice(product.price)}
                              </span>
                            </>
                          ) : (
                            <span className="font-bold text-lg">
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>

                        {/* Stock Status */}
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            product.stock > 10
                              ? "bg-green-100 text-green-700"
                              : product.stock > 0
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {product.stock > 0 ? "متوفر" : "نفذ"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              // List View
              <div className="space-y-4">
                {products.map((product) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Product Image */}
                      <div className="md:w-1/4 relative">
                        <img
                          src={product.mainImage}
                          alt={product.name_ar}
                          className="w-full h-48 md:h-full object-cover"
                        />
                        {/* Badges */}
                        <div className="absolute top-3 left-3 space-y-2">
                          {product.discountPrice && (
                            <span className="block px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
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

                      {/* Product Info */}
                      <div className="md:w-3/4 p-6">
                        <div className="flex flex-col md:flex-row md:items-start justify-between h-full">
                          <div className="flex-1">
                            <h3
                              onClick={() =>
                                navigate(`/products/${product._id}`)
                              }
                              className="font-bold text-xl text-textMain mb-2 hover:text-primary cursor-pointer"
                            >
                              {product.name_ar}
                            </h3>

                            <p className="text-textSoft mb-4 line-clamp-2">
                              {product.description_ar || "لا يوجد وصف"}
                            </p>

                            {/* Rating */}
                            <div className="flex items-center gap-1 mb-3">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={16}
                                  className={`${
                                    star <= (product.averageRating || 0)
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                              <span className="text-sm text-textSoft mr-2">
                                ({product.averageRating?.toFixed(1) || 0})
                              </span>
                            </div>

                            {/* Stock Status */}
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-sm ${
                                product.stock > 10
                                  ? "bg-green-100 text-green-700"
                                  : product.stock > 0
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {product.stock > 0
                                ? `${product.stock} قطعة متوفرة`
                                : "نفذ من المخزون"}
                            </span>
                          </div>

                          <div className="mt-4 md:mt-0 md:text-right">
                            {/* Price */}
                            <div className="mb-4">
                              {product.discountPrice ? (
                                <>
                                  <span className="font-bold text-red-600 text-2xl block">
                                    {formatPrice(product.discountPrice)}
                                  </span>
                                  <span className="text-lg text-textSoft line-through">
                                    {formatPrice(product.price)}
                                  </span>
                                </>
                              ) : (
                                <span className="font-bold text-2xl block">
                                  {formatPrice(product.price)}
                                </span>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleAddToWishlist(product._id)}
                                className={`p-2 rounded-xl ${
                                  wishlist.includes(product._id)
                                    ? "bg-red-100 text-red-600"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                              >
                                <Heart
                                  size={20}
                                  className={
                                    wishlist.includes(product._id)
                                      ? "fill-current"
                                      : ""
                                  }
                                />
                              </button>
                              <button
                                onClick={() => handleQuickView(product._id)}
                                className="p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
                              >
                                <Eye size={20} />
                              </button>
                              <button
                                onClick={() => handleAddToCart(product._id)}
                                className="flex-1 bg-primary text-white py-3 px-6 rounded-xl font-bold hover:bg-secondary transition-colors flex items-center justify-center gap-2"
                              >
                                <ShoppingCart size={20} />
                                أضف إلى السلة
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {products.length > 0 && (
              <div className="flex justify-center mt-12">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={filters.page === 1}
                    className="p-2 rounded-lg border border-borderLight hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={20} />
                  </button>

                  {[1, 2, 3].map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-lg ${
                        filters.page === pageNum
                          ? "bg-primary text-white"
                          : "border border-borderLight hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <span className="px-2">...</span>

                  <button
                    onClick={() => handlePageChange(5)}
                    className={`w-10 h-10 rounded-lg ${
                      filters.page === 5
                        ? "bg-primary text-white"
                        : "border border-borderLight hover:bg-gray-50"
                    }`}
                  >
                    5
                  </button>

                  <button
                    onClick={() => handlePageChange(filters.page + 1)}
                    className="p-2 rounded-lg border border-borderLight hover:bg-gray-50"
                  >
                    <ChevronLeft size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
