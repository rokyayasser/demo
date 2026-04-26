/* eslint-disable no-unused-vars */
// pages/CheckoutPage.jsx — no login required
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  ShoppingBag,
  CreditCard,
  User,
  Mail,
  Phone,
  MapPin,
  Loader,
  Lock,
} from "lucide-react";
import { ProductContext } from "../../context/ProductContext";
import api from "../../api/axios.config";

const Field = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
      {required && <span className="text-red-400 mr-1">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm
        focus:outline-none focus:ring-2 focus:ring-[#9b61db]/40 focus:border-[#9b61db] transition"
    />
  </div>
);

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useContext(ProductContext);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "Cairo",
    address: "",
    notes: "",
  });
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  if (!cart.length) {
    navigate("/cart");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      toast.error("يرجى إدخال الاسم والبريد الإلكتروني والهاتف");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/api/v1/products/checkout", {
        cart: cart.map((i) => ({
          productId: i._id,
          title: i.title_ar || i.title,
          quantity: i.quantity,
          price: i.discountPrice || i.price,
        })),
        total: cartTotal,
        customerInfo: form,
      });

      if (!data.success) {
        toast.error(data.message || "فشل إنشاء الطلب");
        return;
      }

      const paymentUrl = data.data?.paymentUrl || data.data?.iframeUrl;
      if (paymentUrl) {
        // Save info so PaymentCallback can clear cart after success
        sessionStorage.setItem(
          "pending_order",
          JSON.stringify({ email: form.email, name: form.name }),
        );
        toast.info("جارٍ تحويلك لصفحة الدفع...");
        window.location.href = paymentUrl;
        return;
      }

      // No payment gateway configured
      toast.success("تم استقبال طلبك! ستصلك رسالة تأكيد على بريدك الإلكتروني");
      clearCart();
      navigate("/");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "حدث خطأ، يرجى المحاولة لاحقاً",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mt-32 mb-20 px-4 sm:px-6 lg:px-10" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          إتمام الطلب
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          أدخل بياناتك لاستلام تأكيد الطلب — لا تحتاج لحساب
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-800 mb-5 flex items-center gap-2">
                <User className="w-5 h-5 text-[#9b61db]" /> بياناتك
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="الاسم الكامل"
                  value={form.name}
                  onChange={set("name")}
                  placeholder="محمد أحمد"
                  required
                />
                <Field
                  label="البريد الإلكتروني"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="example@email.com"
                  required
                  type="email"
                />
                <Field
                  label="رقم الهاتف"
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="01xxxxxxxxx"
                  required
                />
                <Field
                  label="المدينة"
                  value={form.city}
                  onChange={set("city")}
                  placeholder="القاهرة"
                />
                <div className="sm:col-span-2">
                  <Field
                    label="العنوان"
                    value={form.address}
                    onChange={set("address")}
                    placeholder="الشارع، الحي (اختياري)"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    ملاحظات
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={set("notes")}
                    rows={2}
                    placeholder="أي تفاصيل إضافية..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none
                      focus:outline-none focus:ring-2 focus:ring-[#9b61db]/40"
                  />
                </div>
              </div>
            </div>

            {/* Email notice */}
            <div className="bg-[#9b61db]/5 border border-[#9b61db]/20 rounded-xl p-4 flex items-start gap-3">
              <Mail className="w-5 h-5 text-[#9b61db] mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-[#6d28d9] mb-0.5">
                  تأكيد على بريدك الإلكتروني
                </p>
                <p className="text-gray-500">
                  ستصلك رسالة تأكيد الطلب وفاتورة الشراء فور إتمام الدفع على
                  البريد الذي أدخلته أعلاه.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#6d28d9] to-[#9b61db] text-white
                rounded-xl font-bold text-lg flex items-center justify-center gap-2
                hover:shadow-lg hover:shadow-[#9b61db]/30 transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" /> جارٍ المعالجة...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" /> ادفع الآن —{" "}
                  {cartTotal.toLocaleString()} جنيه
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <Lock className="w-3.5 h-3.5" />
              <span>الدفع آمن ومشفر عبر Paymob</span>
            </div>
          </form>

          {/* Summary */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:sticky lg:top-32">
              <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#9b61db]" /> ملخص الطلب
              </h2>
              <div className="space-y-3 mb-4">
                {cart.map((item) => (
                  <div key={item._id} className="flex gap-3 items-center">
                    <div className="w-11 h-11 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-4 h-4 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {item.title_ar || item.title}
                      </p>
                      <p className="text-xs text-gray-400">× {item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-600 shrink-0">
                      {(
                        (item.discountPrice || item.price) * item.quantity
                      ).toLocaleString()}{" "}
                      ج
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="font-bold text-gray-800">الإجمالي</span>
                <span className="text-xl font-extrabold text-[#9b61db]">
                  {cartTotal.toLocaleString()} جنيه
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
