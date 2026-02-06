/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

import { appointmentApi } from "../../api/appointment.api";
import { paymentApi } from "../../api/payment.api";
import { AppContext } from "../../context/AppContext";

const MyAppointments = () => {
  const { token } = useContext(AppContext);
  const [state, setState] = useState({
    appointments: [],
    loading: false,
    paymentLoading: null,
    showCancelModal: false,
    selectedAppointmentId: null,
    paymentWindow: null,
  });

  // Load appointments
  const loadAppointments = async () => {
    if (!token) return;

    setState((prev) => ({ ...prev, loading: true }));
    try {
      const response = await appointmentApi.getUserAppointments();
      if (response.success) {
        setState((prev) => ({ ...prev, appointments: response.appointments }));
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
      toast.error("حدث خطأ في تحميل المواعيد");
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  // Handle payment
  const handlePayment = async (appointmentId) => {
    setState((prev) => ({ ...prev, paymentLoading: appointmentId }));

    try {
      const response = await paymentApi.initiatePayment(appointmentId);

      if (!response.success) {
        toast.error(response.message);
        setState((prev) => ({ ...prev, paymentLoading: null }));
        return;
      }

      const newWindow = window.open(
        response.paymentUrl,
        "PaymobPayment",
        "width=600,height=700,scrollbars=yes"
      );

      if (!newWindow) {
        toast.error("يرجى السماح بالنوافذ المنبثقة للمتابعة");
        setState((prev) => ({ ...prev, paymentLoading: null }));
        return;
      }

      setState((prev) => ({ ...prev, paymentWindow: newWindow }));
      toast.info("جاري فتح نافذة الدفع...");

      // Poll for window closure
      const checkInterval = setInterval(async () => {
        if (newWindow.closed) {
          clearInterval(checkInterval);
          await verifyPayment(appointmentId);
          setState((prev) => ({
            ...prev,
            paymentLoading: null,
            paymentWindow: null,
          }));
        }
      }, 1000);
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("حدث خطأ أثناء الدفع");
      setState((prev) => ({ ...prev, paymentLoading: null }));
    }
  };

  // Verify payment
  const verifyPayment = async (appointmentId) => {
    try {
      const response = await paymentApi.verifyPayment(appointmentId);
      if (response.paid) {
        toast.success("تم الدفع بنجاح! ✅");
        await loadAppointments();
      }
    } catch (error) {
      console.error("Verification error:", error);
    }
  };

  // Cancel appointment
  const handleCancelAppointment = async () => {
    try {
      const response = await appointmentApi.cancelAppointment(
        state.selectedAppointmentId
      );

      if (response.success) {
        toast.success("تم إلغاء الموعد بنجاح");
        setState((prev) => ({ ...prev, showCancelModal: false }));
        await loadAppointments();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Cancel error:", error);
      toast.error("حدث خطأ أثناء الإلغاء");
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [token]);

  // Clean up payment window on unmount
  useEffect(() => {
    return () => {
      if (state.paymentWindow && !state.paymentWindow.closed) {
        state.paymentWindow.close();
      }
    };
  }, [state.paymentWindow]);

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        badge: "bg-yellow-500",
        text: "قيد الانتظار",
        icon: "⏳",
      },
      confirmed: {
        bg: "bg-green-50",
        border: "border-green-200",
        badge: "bg-green-500",
        text: "مؤكد",
        icon: "✅",
      },
      cancelled: {
        bg: "bg-red-50",
        border: "border-red-200",
        badge: "bg-red-500",
        text: "ملغي",
        icon: "❌",
      },
      completed: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        badge: "bg-blue-500",
        text: "مكتمل",
        icon: "🎯",
      },
    };
    return configs[status] || configs.pending;
  };

  // Format date and time for display
  const formatDateTime = (dateStr, timeStr) => {
    if (!dateStr) return "غير محدد";
    if (!timeStr) return dateStr;
    return `${dateStr} - ${timeStr}`;
  };

  if (!token) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[60vh] flex items-center justify-center"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="bg-accent p-6 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center"
          >
            <svg
              className="w-12 h-12 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </motion.div>
          <p className="text-textMain text-lg font-medium">
            يرجى تسجيل الدخول لعرض مواعيدك
          </p>
        </div>
      </motion.div>
    );
  }

  if (state.loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[60vh] flex items-center justify-center"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"
          ></motion.div>
          <p className="text-textSoft text-lg">جاري تحميل المواعيد...</p>
        </div>
      </motion.div>
    );
  }

  if (state.appointments.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[60vh] flex items-center justify-center"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="bg-lightBg p-6 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center"
          >
            <svg
              className="w-12 h-12 text-textSoft"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </motion.div>
          <p className="text-textMain text-lg font-medium mb-2">
            لا توجد مواعيد حتى الآن
          </p>
          <p className="text-textSoft">ابدأ بحجز موعدك الأول معنا</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto py-10 px-4"
      dir="rtl"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">
          مواعيدي
        </h2>
        <p className="text-textSoft text-lg">
          إدارة ومتابعة جميع مواعيدك الطبية
        </p>
      </motion.div>

      {/* Appointments grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {state.appointments.map((appt) => {
          const statusConfig = getStatusConfig(appt.status);

          return (
            <motion.div
              key={appt._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{
                y: -5,
                boxShadow: "0 15px 40px rgba(0, 0, 0, 0.1)",
              }}
              className={`border-2 ${statusConfig.border} ${statusConfig.bg} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300`}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-textMain mb-1">
                    {appt.serviceId?.title || appt.category || "غير محدد"}
                  </h3>
                  <p className="text-sm text-textSoft">
                    {appt.doctorName || "الدكتور الخطيب"}
                  </p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`${statusConfig.badge} text-white px-4 py-2 rounded-full shadow-md flex items-center gap-2`}
                >
                  <span>{statusConfig.icon}</span>
                  <span className="font-semibold text-sm">
                    {statusConfig.text}
                  </span>
                </motion.div>
              </div>

              {/* Date & Time */}
              <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="bg-primary/10 p-3 rounded-lg"
                    >
                      <svg
                        className="w-6 h-6 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </motion.div>
                    <div>
                      <p className="text-xs text-textSoft font-medium">
                        التاريخ
                      </p>
                      <p className="text-textMain font-bold text-lg">
                        {formatDateTime(appt.date, appt.time)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amount & Payment Status */}
              <div className="flex gap-3 mb-6">
                <div className="flex-1 bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="bg-green-100 p-2 rounded-lg"
                    >
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </motion.div>
                    <div>
                      <p className="text-xs text-textSoft font-medium">
                        المبلغ
                      </p>
                      <p className="text-textMain font-bold text-lg">
                        {appt.amount} جنيه
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{
                        scale: appt.paid ? [1, 1.1, 1] : 1,
                      }}
                      transition={{
                        repeat: appt.paid ? Infinity : 0,
                        duration: 2,
                      }}
                      className={`${
                        appt.paid ? "bg-green-100" : "bg-orange-100"
                      } p-2 rounded-lg`}
                    >
                      <svg
                        className={`w-5 h-5 ${
                          appt.paid ? "text-green-600" : "text-orange-600"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </motion.div>
                    <div>
                      <p className="text-xs text-textSoft font-medium">الدفع</p>
                      <p
                        className={`font-bold text-lg ${
                          appt.paid ? "text-green-600" : "text-orange-600"
                        }`}
                      >
                        {appt.paid ? "مدفوع ✓" : "غير مدفوع"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {!appt.paid && appt.status !== "cancelled" && (
                <div className="space-y-3 pt-6 border-t border-gray-200">
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePayment(appt._id)}
                      disabled={state.paymentLoading === appt._id}
                      className="flex-1 bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-xl font-bold hover:from-secondary hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {state.paymentLoading === appt._id ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          <span>جاري المعالجة...</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                          </svg>
                          <span>الدفع الآن</span>
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setState((prev) => ({
                          ...prev,
                          selectedAppointmentId: appt._id,
                          showCancelModal: true,
                        }));
                      }}
                      disabled={state.paymentLoading === appt._id}
                      className="px-6 bg-white border-2 border-red-500 text-red-500 py-3 rounded-xl font-bold hover:bg-red-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      إلغاء
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Paid badge */}
              {appt.paid && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="pt-6 border-t border-gray-200"
                >
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl text-center font-bold flex items-center justify-center gap-2">
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    تم الدفع بنجاح
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Cancel Modal */}
      <AnimatePresence>
        {state.showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 w-full max-w-md text-center shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </motion.div>
              <h3 className="text-2xl font-bold text-textMain mb-3">
                إلغاء الموعد
              </h3>
              <p className="text-textSoft mb-6">
                هل أنت متأكد من رغبتك في إلغاء هذا الموعد؟ لا يمكن التراجع عن
                هذا الإجراء.
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setState((prev) => ({ ...prev, showCancelModal: false }))
                  }
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all duration-300"
                >
                  تراجع
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancelAppointment}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all duration-300"
                >
                  نعم، إلغاء الموعد
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MyAppointments;
