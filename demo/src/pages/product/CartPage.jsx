/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ProductContext } from "../../context/ProductContext";
import { AppContext } from "../../context/AppContext";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Truck,
  Shield,
  CreditCard,
  Package,
} from "lucide-react";
import { toast } from "react-toastify";

const CartPage = () => {
  const navigate = useNavigate();

  const {
    cart,
    getCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    formatPrice,
    isLoading,
  } = useContext(ProductContext);

  const { token } = useContext(AppContext);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [estimatedDelivery, useStateDelivery] = useState("2-3 أيام عمل");

  useEffect(() => {
    if (token) {
      getCart();
    }
  }, [token]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateCartItem(itemId, newQuantity);
  };

  const handleRemoveItem = async (itemId) => {
    await removeCartItem(itemId);
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error("الرجاء إدخال كود الخصم");
      return;
    }

    // Simulate coupon validation
    if (couponCode.toUpperCase() === "SAVE10") {
      setAppliedCoupon({
        code: "SAVE10",
        discount: cart.subtotal * 0.1, // 10% discount
      });
      toast.success("تم تطبيق كود الخصم بنجاح!");
    } else if (couponCode.toUpperCase() === "SAVE20") {
      setAppliedCoupon({
        code: "SAVE20",
        discount: cart.subtotal * 0.2, // 20% discount
      });
      toast.success("تم تطبيق كود الخصم بنجاح!");
    } else {
      toast.error("كود الخصم غير صالح");
    }
  };

  const handleClearCart = async () => {
    if (window.confirm("هل أنت متأكد من تفريغ السلة؟")) {
      await clearCart();
      toast.success("تم تفريغ السلة");
    }
  };

  const handleCheckout = () => {
    if (!token) {
      toast.info("يجب تسجيل الدخول أولاً لإتمام الطلب");
      navigate("/login", { state: { from: "/cart" } });
      return;
    }

    if (!cart || cart.items.length === 0) {
      toast.error("السلة فارغة");
      return;
    }

    navigate("/checkout");
  };

  const calculateTotal = () => {
    if (!cart) return 0;

    let total = cart.subtotal;

    // Add shipping (30 EGP for orders under 500 EGP)
    const shipping = cart.subtotal >= 500 ? 0 : 30;

    // Add tax (14%)
    const tax = cart.subtotal * 0.14;

    // Apply coupon discount
    const discount = appliedCoupon?.discount || 0;

    total = total + shipping + tax - discount;

    return {
      subtotal: cart.subtotal,
      shipping,
      tax,
      discount,
      total: Math.max(0, total),
    };
  };

  const totals = calculateTotal();

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-textMain mb-2">
            سلة التسوق فارغة
          </h3>
          <p className="text-textSoft mb-6">يجب تسجيل الدخول لعرض سلة التسوق</p>
          <button
            onClick={() => navigate("/login", { state: { from: "/cart" } })}
            className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-secondary transition-colors"
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-textSoft text-lg">جاري تحميل سلة التسوق...</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center bg-white rounded-2xl shadow-lg p-12">
            <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-textMain mb-2">
              سلة التسوق فارغة
            </h3>
            <p className="text-textSoft mb-8">
              ابدأ بإضافة بعض المنتجات إلى سلة التسوق
            </p>
            <button
              onClick={() => navigate("/products")}
              className="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-secondary transition-colors text-lg"
            >
              تصفح المنتجات
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate("/products")}
            className="flex items-center gap-2 text-primary hover:text-secondary"
          >
            <ArrowLeft size={20} />
            العودة للتسوق
          </button>
          <h1 className="text-3xl font-bold text-primary">سلة التسوق</h1>
          <span className="px-3 py-1 bg-primary text-white rounded-full text-sm font-bold">
            {cart.totalItems} منتج
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-primary">منتجاتك</h2>
                <button
                  onClick={handleClearCart}
                  className="text-red-600 hover:text-red-700 flex items-center gap-2"
                >
                  <Trash2 size={18} />
                  تفريغ السلة
                </button>
              </div>

              <div className="space-y-6">
                {cart.items.map((item) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row gap-6 p-4 border border-borderLight rounded-xl"
                  >
                    {/* Product Image */}
                    <div className="md:w-1/4">
                      <img
                        src={item.product.mainImage}
                        alt={item.product.name_ar}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="md:w-3/4">
                      <div className="flex flex-col md:flex-row md:items-start justify-between h-full">
                        <div className="flex-1">
                          <h3
                            onClick={() =>
                              navigate(`/products/${item.product._id}`)
                            }
                            className="font-bold text-lg text-textMain mb-2 hover:text-primary cursor-pointer"
                          >
                            {item.product.name_ar}
                          </h3>

                          {item.selectedSize && (
                            <p className="text-textSoft mb-1">
                              المقاس:{" "}
                              <span className="font-medium">
                                {item.selectedSize}
                              </span>
                            </p>
                          )}

                          {item.selectedColor && (
                            <p className="text-textSoft mb-3">
                              اللون:{" "}
                              <span className="font-medium">
                                {item.selectedColor}
                              </span>
                            </p>
                          )}

                          {/* Price */}
                          <div className="mb-4">
                            <span className="font-bold text-lg">
                              {formatPrice(item.price)}
                            </span>
                            <span className="text-textSoft text-sm mr-2">
                              لكل قطعة
                            </span>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex flex-col items-end gap-4">
                          <div className="flex items-center border border-borderLight rounded-xl">
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item._id,
                                  item.quantity - 1
                                )
                              }
                              disabled={item.quantity <= 1}
                              className="px-4 py-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus size={18} />
                            </button>
                            <span className="px-4 py-2 font-bold min-w-12 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item._id,
                                  item.quantity + 1
                                )
                              }
                              disabled={item.quantity >= item.product.stock}
                              className="px-4 py-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus size={18} />
                            </button>
                          </div>

                          {/* Item Total */}
                          <div className="text-right">
                            <p className="font-bold text-lg">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                            <p className="text-sm text-textSoft">الإجمالي</p>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveItem(item._id)}
                            className="text-red-600 hover:text-red-700 flex items-center gap-2"
                          >
                            <Trash2 size={16} />
                            إزالة
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <Truck className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-textMain mb-2">شحن مجاني</h3>
                <p className="text-sm text-textSoft">للطلبات فوق 500 جنيه</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-textMain mb-2">ضمان الإرجاع</h3>
                <p className="text-sm text-textSoft">إرجاع مجاني خلال 14 يوم</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <Package className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-textMain mb-2">توصيل سريع</h3>
                <p className="text-sm text-textSoft">توصيل خلال 2-3 أيام</p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-primary mb-6">
                ملخص الطلب
              </h2>

              {/* Coupon Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-textMain mb-2">
                  كود الخصم
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="أدخل كود الخصم"
                    className="flex-1 px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    dir="ltr"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="px-4 py-3 bg-gray-100 text-textMain rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    تطبيق
                  </button>
                </div>

                {appliedCoupon && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-green-700 font-medium">
                        كود {appliedCoupon.code} مطبق
                      </span>
                      <span className="text-green-700 font-bold">
                        -{formatPrice(appliedCoupon.discount)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-textSoft">السعر الإجمالي</span>
                  <span className="font-medium">
                    {formatPrice(totals.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-textSoft">تكلفة الشحن</span>
                  <span
                    className={`font-medium ${
                      totals.shipping === 0 ? "text-green-600" : ""
                    }`}
                  >
                    {totals.shipping === 0
                      ? "مجاني"
                      : formatPrice(totals.shipping)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-textSoft">الضريبة (14%)</span>
                  <span className="font-medium">{formatPrice(totals.tax)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between">
                    <span className="text-textSoft">الخصم</span>
                    <span className="font-medium text-green-600">
                      -{formatPrice(totals.discount)}
                    </span>
                  </div>
                )}

                <div className="border-t border-borderLight pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>المجموع</span>
                    <span className="text-primary">
                      {formatPrice(totals.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Estimated Delivery */}
              <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Truck className="text-blue-600" size={20} />
                  <div>
                    <p className="font-medium text-textMain">التوصيل المتوقع</p>
                    <p className="text-sm text-textSoft">{estimatedDelivery}</p>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-secondary transition-colors flex items-center justify-center gap-2 text-lg"
              >
                <CreditCard size={24} />
                إتمام الشراء
              </button>

              {/* Continue Shopping */}
              <button
                onClick={() => navigate("/products")}
                className="w-full mt-4 py-3 border border-primary text-primary rounded-xl font-bold hover:bg-primary hover:text-white transition-colors"
              >
                متابعة التسوق
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
