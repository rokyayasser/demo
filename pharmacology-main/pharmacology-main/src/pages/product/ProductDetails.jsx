/* eslint-disable no-unused-vars */
// pages/ProductDetails.jsx  (user side)
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  ShoppingCart,
  Package,
  Star,
  ArrowRight,
  Check,
  Minus,
  Plus,
} from "lucide-react";
import { ProductContext } from "../../context/ProductContext";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProductDetails, getProductById, addToCart } =
    useContext(ProductContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Support both function names
        const fn = getProductDetails || getProductById;
        if (typeof fn !== "function") {
          toast.error("فشل تحميل المنتج");
          navigate("/products");
          return;
        }
        const data = await fn(id);
        if (data) setProduct(data);
        else {
          toast.error("المنتج غير موجود");
          navigate("/products");
        }
      } catch {
        toast.error("فشل تحميل المنتج");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center mt-32">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#9b61db] border-t-transparent" />
      </div>
    );
  }

  if (!product) return null;

  const price = product.discountPrice || product.price;
  const hasDiscount =
    product.discountPrice && product.discountPrice < product.price;
  const discountPct = hasDiscount
    ? Math.round(
        ((product.price - product.discountPrice) / product.price) * 100,
      )
    : 0;
  const outOfStock = product.stock === 0;
  const unavailable = product.available === false;

  return (
    <div className="min-h-screen mt-32 mb-20 px-4 sm:px-6 lg:px-10" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-400 mb-8 flex items-center gap-2">
          <span
            className="cursor-pointer hover:text-gray-600"
            onClick={() => navigate("/")}
          >
            الرئيسية
          </span>
          <span>/</span>
          <span
            className="cursor-pointer hover:text-gray-600"
            onClick={() => navigate("/products")}
          >
            المنتجات
          </span>
          <span>/</span>
          <span className="text-gray-700 truncate max-w-[200px]">
            {product.title_ar || product.title}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="relative rounded-3xl overflow-hidden bg-gray-50 aspect-square">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.title_ar}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-24 h-24 text-gray-200" />
                </div>
              )}
              {hasDiscount && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full">
                  خصم {discountPct}%
                </div>
              )}
              {(unavailable || outOfStock) && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-red-500 text-white font-bold px-6 py-2.5 rounded-full text-lg">
                    {unavailable ? "غير متاح حالياً" : "نفذ من المخزون"}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-5"
          >
            {/* Category */}
            {product.category && (
              <span className="text-sm text-[#9b61db] font-medium flex items-center gap-1">
                <Package className="w-4 h-4" />
                {product.category}
              </span>
            )}

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 leading-snug">
              {product.title_ar || product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= Math.round(product.rating || 4.5)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-200 fill-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-400">
                ({product.ratingCount || product.rating?.toFixed?.(1) || "4.5"})
              </span>
              {product.stock > 0 && (
                <span className="text-sm text-green-600 font-medium mr-2">
                  ✓ متوفر ({product.stock} قطعة)
                </span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-end gap-3">
              <span className="text-4xl font-extrabold text-[#9b61db]">
                {price?.toLocaleString()} جنيه
              </span>
              {hasDiscount && (
                <span className="text-xl text-gray-400 line-through pb-1">
                  {product.price?.toLocaleString()}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-loose">
              {product.description_ar || product.description}
            </p>

            {/* Quantity selector */}
            {!outOfStock && !unavailable && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">
                  الكمية:
                </span>
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-[#9b61db] transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-bold text-lg">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.min(product.stock || 99, q + 1))
                    }
                    className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-[#9b61db] transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* CTA buttons */}
            <div className="flex gap-3 flex-col sm:flex-row">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                disabled={outOfStock || unavailable}
                className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
                  ${
                    outOfStock || unavailable
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : added
                        ? "bg-green-500 text-white"
                        : "bg-gradient-to-r from-[#6d28d9] to-[#9b61db] text-white hover:shadow-lg hover:shadow-[#9b61db]/30"
                  }`}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5" /> تمت الإضافة!
                  </>
                ) : outOfStock ? (
                  "نفذ من المخزون"
                ) : unavailable ? (
                  "غير متاح"
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" /> أضف للسلة
                  </>
                )}
              </motion.button>

              <button
                onClick={() => navigate("/products")}
                className="px-6 py-4 border border-gray-200 text-gray-600 rounded-xl
                  hover:bg-gray-50 transition font-medium flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                العودة
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
