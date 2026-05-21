/* eslint-disable no-unused-vars */
// pages/ProductsPage.jsx  (user side)
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Package, Star, ShoppingCart } from "lucide-react";
import { ProductContext } from "../../context/ProductContext";
import AnimatedText from "../../components/common/AnimatedContent";
import DualPrice from "../../components/common/DualPrice";
import ComingSoon from "../../components/common/CommingSoon";
import { FEATURES } from "../../config/features";

// ─── Single product card ──────────────────────────────────────────────────────
// Matches the style of the home ProductsSection carousel cards.
const ProductCard = ({ product, onView }) => {
  const unavailable = product.available === false;

  return (
    <motion.div
      whileHover={
        unavailable ? {} : { y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.25)" }
      }
      transition={{ duration: 0.3 }}
      className={`relative bg-white rounded-2xl overflow-hidden border border-gray-100
        shadow-sm flex flex-col
        ${unavailable ? "opacity-70" : "cursor-pointer hover:shadow-lg"}`}
    >
      {/* Unavailable overlay */}
      {unavailable && (
        <div
          className="absolute inset-0 z-10 flex items-end justify-center
          pb-6 rounded-2xl bg-black/30 pointer-events-none"
        >
          <span className="bg-red-500 text-white text-sm font-bold px-5 py-2 rounded-full shadow-lg">
            غير متاح حالياً
          </span>
        </div>
      )}

      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-gray-50">
        {product.image ? (
          <img
            src={product.image}
            alt={product.title_ar || product.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <Package className="w-14 h-14 text-gray-300" />
          </div>
        )}

        {/* Discount badge */}
        {product.discountPrice && product.discountPrice < product.price && (
          <div
            className="absolute top-3 left-3 bg-red-500 text-white text-xs
            font-bold px-2.5 py-1 rounded-full"
          >
            خصم{" "}
            {Math.round(
              ((product.price - product.discountPrice) / product.price) * 100,
            )}
            %
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1" dir="rtl">
        {/* Category */}
        {product.category && (
          <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
            <Package className="w-3.5 h-3.5" />
            <span>{product.category}</span>
          </div>
        )}

        {/* Title */}
        <h3 className="font-bold text-gray-800 text-base leading-snug mb-2 line-clamp-2">
          {product.title_ar || product.title}
        </h3>

        {/* Description */}
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
          {product.description_ar || product.description || ""}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`w-3.5 h-3.5 ${
                s <= Math.round(product.rating || 4.5)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-200 fill-gray-200"
              }`}
            />
          ))}
          <span className="text-xs text-gray-400 mr-1">
            ({product.ratingCount || product.rating?.toFixed(1) || "4.5"})
          </span>
        </div>

        {/* Price row */}
        <div className="flex items-center justify-between mb-4">
          <div>
            {product.discountPrice && product.discountPrice < product.price ? (
              <div className="flex flex-col items-start gap-0.5">
                <DualPrice
                  egp={product.discountPrice}
                  size="md"
                  className="text-[#9b61db]"
                />
                <DualPrice
                  egp={product.price}
                  size="sm"
                  className="text-gray-400 line-through"
                />
              </div>
            ) : (
              <DualPrice
                egp={product.price}
                size="md"
                className="text-[#9b61db]"
              />
            )}
          </div>

          {/* Stock indicator */}
          {product.stock !== undefined && (
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium
              ${
                product.stock > 10
                  ? "bg-green-50 text-green-700"
                  : product.stock > 0
                    ? "bg-yellow-50 text-yellow-700"
                    : "bg-red-50 text-red-600"
              }`}
            >
              {product.stock > 0 ? `${product.stock} متاح` : "نفذ"}
            </span>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={() => !unavailable && onView(product._id)}
          disabled={unavailable || product.stock === 0}
          className={`w-full py-3 rounded-xl font-bold text-sm flex items-center
            justify-center gap-2 transition-all
            ${
              unavailable || product.stock === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-[#6d28d9] to-[#9b61db] text-white hover:shadow-lg hover:shadow-[#9b61db]/30 active:scale-[0.98]"
            }`}
        >
          <ShoppingCart className="w-4 h-4" />
          {unavailable
            ? "غير متاح"
            : product.stock === 0
              ? "نفذ من المخزون"
              : "عرض المنتج"}
        </button>
      </div>
    </motion.div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
const ProductsPage = () => {
  const navigate = useNavigate();
  const {
    products: rawProducts,
    getAllProducts,
    isLoading,
  } = useContext(ProductContext);
  const [searchTerm, setSearchTerm] = useState("");

  // ── Coming Soon gate — flip PRODUCTS_COMING_SOON in src/config/features.js ─
  if (FEATURES.PRODUCTS_COMING_SOON) {
    return (
      <ComingSoon
        title="المنتجات"
        subtitle="متجر د. أحمد الخطيب قادم قريباً — ترقبوا!"
      />
    );
  }

  // Always guarantee an array regardless of context shape
  const products = Array.isArray(rawProducts)
    ? rawProducts
    : Array.isArray(rawProducts?.products)
      ? rawProducts.products
      : Array.isArray(rawProducts?.data)
        ? rawProducts.data
        : [];

  useEffect(() => {
    getAllProducts();
  }, []);

  const filteredData = searchTerm
    ? products.filter(
        (p) =>
          (p.title_ar || p.title || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (p.category || "").toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : products;

  return (
    <div className="mt-40 my-12 px-4 sm:px-6 lg:px-10 min-h-screen" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-right">
          <AnimatedText delay={0.1}>
            <div className="text-xs md:text-sm text-gray-400 mb-3 flex items-center gap-1">
              <span
                className="cursor-pointer hover:text-secondary transition-colors"
                onClick={() => navigate("/")}
              >
                الرئيسية
              </span>
              <span>/</span>
              <span className="text-secondary">المنتجات</span>
            </div>
          </AnimatedText>
          <AnimatedText delay={0.2}>
            <h1 className="text-2xl md:text-4xl font-bold mb-4">
              منتجات مختارة لدعم رحلتك الصحية
            </h1>
          </AnimatedText>
          <AnimatedText delay={0.3}>
            <p className="text-sm md:text-base leading-relaxed max-w-3xl text-gray-400">
              مجموعة من المنتجات الغذائية والمكملات المختارة بعناية لدعم خطتك
              العلاجية.
            </p>
          </AnimatedText>
        </div>

        {/* Search + count */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center
          justify-between gap-4 mb-10"
        >
          <AnimatedText delay={0.4}>
            <div className="relative w-full sm:max-w-sm">
              <Search
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="ابحث عن منتج أو فئة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-11 pl-4 py-3 border border-gray-200 rounded-xl
                  focus:ring-2 focus:ring-[#9b61db]/40 focus:border-[#9b61db]
                  text-right bg-gray-50/50 outline-none text-sm transition-all"
              />
            </div>
          </AnimatedText>

          {!isLoading && (
            <span className="text-sm text-gray-400 whitespace-nowrap">
              {filteredData.length} منتج
            </span>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-24">
            <div
              className="animate-spin rounded-full h-16 w-16
              border-4 border-[#9b61db] border-t-transparent"
            />
          </div>
        )}

        {/* Grid */}
        {!isLoading && (
          <>
            {filteredData.length === 0 ? (
              <div className="text-center py-24">
                <div
                  className="w-20 h-20 bg-gray-100 rounded-full flex items-center
                  justify-center mx-auto mb-5"
                >
                  <Package className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  {searchTerm
                    ? "لا توجد منتجات مطابقة لبحثك"
                    : "لا توجد منتجات متاحة حالياً"}
                </h3>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="mt-4 text-sm text-[#9b61db] hover:underline"
                  >
                    مسح البحث
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredData.map((product, index) => (
                  <AnimatedText key={product._id} delay={0.1 + index * 0.04}>
                    <ProductCard
                      product={product}
                      onView={(id) => navigate(`/products/${id}`)}
                    />
                  </AnimatedText>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
