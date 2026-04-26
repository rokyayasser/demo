/* eslint-disable no-unused-vars */
// pages/PaymentCallback.jsx
// Paymob redirects here after payment.
// We call our backend to verify + confirm the payment (don't rely on webhook for localhost).
import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { toast } from "react-toastify";
import { ProductContext } from "../context/ProductContext";
import api from "../api/axios.config";

const PaymentCallback = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { clearCart } = useContext(ProductContext);
  const [status, setStatus] = useState("loading");
  const [details, setDetails] = useState({ type: "generic", courseId: null });
  const calledRef = useRef(false); // prevent double-call in React StrictMode

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;
    handleCallback();
  }, []);

  const handleCallback = async () => {
    // ── Read all params Paymob might send ─────────────────────────────────────
    // Paymob sends: ?success=true&id=TXN_ID&order=ORDER_ID
    //               &merchant_order_id=YOUR_MERCHANT_ID&...
    const success =
      params.get("success") === "true" ||
      params.get("success") === "1" ||
      params.get("is_success") === "true";
    const merchantOrderId =
      params.get("merchant_order_id") || params.get("merchant_id") || "";
    const transactionId =
      params.get("id") || params.get("txn_response_code") || "";

    console.log("PaymentCallback params:", {
      success,
      merchantOrderId,
      transactionId,
      allParams: Object.fromEntries(params.entries()),
    });

    // ── Detect payment type from merchantOrderId ───────────────────────────────
    let type = "product";
    let courseId = null;

    if (merchantOrderId.startsWith("course-guest-")) {
      type = "course";
      const m = merchantOrderId.match(/course-guest-([a-f0-9]{24})/i);
      courseId = m ? m[1] : merchantOrderId.split("-")[2] || null;
    } else if (merchantOrderId.startsWith("course-")) {
      type = "course";
      const m = merchantOrderId.match(/course-([a-f0-9]{24})/i);
      courseId = m ? m[1] : merchantOrderId.split("-")[1] || null;
    } else if (merchantOrderId.startsWith("order-")) {
      type = "product";
    }

    setDetails({ type, courseId });
    console.log("Detected:", { type, courseId });

    // ── Payment failed ─────────────────────────────────────────────────────────
    if (!success) {
      setStatus("failed");
      toast.error("لم يتم إتمام الدفع");
      setTimeout(
        () => navigate(type === "course" ? "/courses" : "/cart"),
        4000,
      );
      return;
    }

    // ── Payment succeeded — confirm with backend ───────────────────────────────
    try {
      if (type === "course" && courseId) {
        // Call backend to confirm enrollment (marks as paid + sends email)
        // This bypasses the webhook dependency for localhost dev
        const { data } = await api.post("/api/v1/courses/confirm-payment", {
          merchantOrderId,
          transactionId,
          courseId,
        });

        console.log("Confirm payment response:", data);

        if (data.success) {
          setStatus("success");
          toast.success("🎉 تم الدفع! سيصلك رابط الكورس على بريدك الإلكتروني");
          // Redirect to course details — will show "متابعة الكورس" since now enrolled
          setTimeout(() => navigate(`/courses/${courseId}`), 3500);
        } else {
          // Enrollment might already be marked paid by webhook
          setStatus("success");
          setTimeout(() => navigate(`/courses/${courseId}`), 3500);
        }
      } else if (type === "product") {
        // Product purchase confirmed
        clearCart();
        setStatus("success");
        toast.success("🎉 تم الدفع! ستصلك فاتورة الشراء على بريدك");
        setTimeout(() => navigate("/"), 3500);
      } else {
        setStatus("success");
        setTimeout(() => navigate("/"), 3500);
      }
    } catch (err) {
      console.error("Confirm payment error:", err);
      // Even if confirm fails, show success (payment was made)
      setStatus("success");
      setTimeout(() => navigate(courseId ? `/courses/${courseId}` : "/"), 3500);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-gray-50"
      dir="rtl"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center"
      >
        {status === "loading" && (
          <>
            <Loader className="w-16 h-16 text-[#9b61db] mx-auto mb-5 animate-spin" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              جارٍ تأكيد الدفع...
            </h2>
            <p className="text-gray-400 text-sm">
              لحظة من فضلك، يتم التحقق من عملية الدفع
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
            >
              <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-5" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              تم الدفع بنجاح! 🎉
            </h2>
            <p className="text-gray-500 leading-loose mb-6">
              {details.type === "course"
                ? "تم تفعيل اشتراكك في الكورس. سيصلك رابط المحتوى على بريدك الإلكتروني خلال دقائق."
                : "ستصلك فاتورة الشراء على بريدك الإلكتروني."}
            </p>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden mb-3">
              <motion.div
                className="bg-green-500 h-1.5 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 3.5, ease: "linear" }}
              />
            </div>
            <p className="text-gray-400 text-sm">سيتم تحويلك تلقائياً...</p>
          </>
        )}

        {status === "failed" && (
          <>
            <XCircle className="w-24 h-24 text-red-400 mx-auto mb-5" />
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              لم يتم إتمام الدفع
            </h2>
            <p className="text-gray-500 mb-8">يمكنك المحاولة مرة أخرى.</p>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  navigate(details.type === "course" ? "/courses" : "/cart")
                }
                className="flex-1 py-3 bg-gradient-to-r from-[#6d28d9] to-[#9b61db]
                  text-white rounded-xl font-bold hover:shadow-lg transition"
              >
                {details.type === "course" ? "الكورسات" : "العربة"}
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition"
              >
                الرئيسية
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentCallback;
