/* eslint-disable no-unused-vars */
// pages/CartPage.jsx — no login required
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  ArrowLeft,
  Package,
} from "lucide-react";
import { ProductContext } from "../../context/ProductContext";

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, removeFromCart, updateCartQty, clearCart } =
    useContext(ProductContext);

  if (cart.length === 0)
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center mt-32 px-4"
        dir="rtl"
      >
        <ShoppingCart className="w-24 h-24 text-gray-200 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-700 mb-3">
          عربة التسوق فارغة
        </h2>
        <p className="text-gray-400 mb-8 text-center">
          أضف بعض المنتجات وتابع الطلب بدون تسجيل دخول
        </p>
        <button
          onClick={() => navigate("/products")}
          className="px-8 py-3 bg-gradient-to-r from-[#6d28d9] to-[#9b61db] text-white rounded-xl font-bold hover:shadow-lg transition"
        >
          تصفح المنتجات
        </button>
      </div>
    );

  return (
    <div className="min-h-screen mt-32 mb-20 px-4 sm:px-6 lg:px-10" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              عربة التسوق
            </h1>
            <p className="text-gray-400 text-sm mt-1">{cart.length} منتج</p>
          </div>
          <button
            onClick={clearCart}
            className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-600 transition"
          >
            <Trash2 className="w-4 h-4" /> مسح الكل
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence>
              {cart.map((item, i) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-4 items-center"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title_ar}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-7 h-7 text-gray-200" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 truncate">
                      {item.title_ar || item.title}
                    </h3>
                    <p className="text-xs text-gray-400">{item.category}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-[#9b61db]">
                        {(item.discountPrice || item.price)?.toLocaleString()}{" "}
                        جنيه
                      </span>
                      {item.discountPrice &&
                        item.discountPrice < item.price && (
                          <span className="text-xs text-gray-400 line-through">
                            {item.price?.toLocaleString()}
                          </span>
                        )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-2 py-1">
                      <button
                        onClick={() =>
                          updateCartQty(item._id, item.quantity - 1)
                        }
                        className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-[#9b61db]"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-bold text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateCartQty(item._id, item.quantity + 1)
                        }
                        className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-[#9b61db]"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-xs font-bold text-gray-500">
                      {(
                        (item.discountPrice || item.price) * item.quantity
                      ).toLocaleString()}{" "}
                      ج
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:sticky lg:top-32">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                ملخص الطلب
              </h2>
              <div className="space-y-2 mb-4">
                {cart.map((i) => (
                  <div
                    key={i._id}
                    className="flex justify-between text-sm text-gray-500"
                  >
                    <span className="truncate max-w-[140px]">
                      {i.title_ar || i.title} × {i.quantity}
                    </span>
                    <span className="font-medium">
                      {(
                        (i.discountPrice || i.price) * i.quantity
                      ).toLocaleString()}{" "}
                      ج
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 mb-5 flex justify-between">
                <span className="font-bold text-gray-800">الإجمالي</span>
                <span className="text-xl font-extrabold text-[#9b61db]">
                  {cartTotal.toLocaleString()} جنيه
                </span>
              </div>
              <button
                onClick={() => navigate("/checkout")}
                className="w-full py-4 bg-gradient-to-r from-[#6d28d9] to-[#9b61db] text-white
                  rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition"
              >
                إتمام الطلب <ArrowLeft className="w-4 h-4" />
              </button>
              <p className="text-center text-xs text-gray-400 mt-3">
                لا تحتاج لتسجيل دخول
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
