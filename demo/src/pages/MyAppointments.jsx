/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const MyAppointments = () => {
  const { token, backendUrl } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [paymentWindow, setPaymentWindow] = useState(null);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
      },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
    hover: {
      y: -5,
      boxShadow: "0 15px 40px rgba(0, 0, 0, 0.1)",
      transition: {
        duration: 0.3,
      },
    },
  };

  const loadAppointments = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/appointments/user`, {
        headers: { token },
      });
      if (data.success) {
        setAppointments(data.appointments);
        console.log("Appointments loaded:", data.appointments);
      } else {
        toast.error(data.message || "حدث خطأ أثناء جلب المواعيد");
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("حدث خطأ أثناء جلب المواعيد");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (appointmentId) => {
    setPaymentLoading(appointmentId);

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/payment/initiate`,
        { appointmentId },
        { headers: { token } }
      );

      if (!data.success) {
        toast.error(data.message || "فشل بدء عملية الدفع");
        setPaymentLoading(null);
        return;
      }

      const newWindow = window.open(
        data.paymentUrl,
        "PaymobPayment",
        "width=600,height=700,scrollbars=yes"
      );

      if (!newWindow) {
        toast.error("يرجى السماح بالنوافذ المنبثقة للمتابعة");
        setPaymentLoading(null);
        return;
      }

      setPaymentWindow(newWindow);
      toast.info("جاري فتح نافذة الدفع...");

      const checkInterval = setInterval(async () => {
        if (newWindow.closed) {
          clearInterval(checkInterval);

          try {
            const { data: verifyData } = await axios.get(
              `${backendUrl}/api/payment/verify/${appointmentId}`,
              { headers: { token } }
            );

            if (verifyData.paid) {
              toast.success("تم الدفع بنجاح! ✅");
              setTimeout(() => loadAppointments(), 1000);
            } else {
              toast.info("تم إغلاق نافذة الدفع");
            }
          } catch (error) {
            console.error("Verification error:", error);
          }

          setPaymentLoading(null);
          setPaymentWindow(null);
        }
      }, 1000);
    } catch (error) {
      console.error("Payment Error:", error);
      toast.error("حدث خطأ أثناء الدفع");
      setPaymentLoading(null);
    }
  };

  const cancelAppointment = async () => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/appointments/cancel`,
        { appointmentId: selectedAppointmentId },
        { headers: { token } }
      );

      if (data.success) {
        toast.success("تم إلغاء الموعد بنجاح");
        setShowCancelModal(false);
        setTimeout(() => loadAppointments(), 500);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Cancel error:", error);
      toast.error("حدث خطأ أثناء الإلغاء");
    }
  };

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

    let displayDate = dateStr;
    let displayTime = timeStr || "";

    // If time exists, format it nicely
    if (displayTime) {
      // Remove any extra spaces and ensure proper formatting
      displayTime = displayTime.trim();
      return `${displayDate} - ${displayTime}`;
    }

    return displayDate;
  };

  useEffect(() => {
    loadAppointments();
  }, [token]);

  useEffect(() => {
    return () => {
      if (paymentWindow && !paymentWindow.closed) {
        paymentWindow.close();
      }
    };
  }, [paymentWindow]);

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

  if (loading) {
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

  if (appointments.length === 0) {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
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
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
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
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-6 md:grid-cols-2"
      >
        {appointments.map((appt) => {
          const statusConfig = getStatusConfig(appt.status);

          return (
            <motion.div
              key={appt._id}
              variants={cardVariants}
              whileHover="hover"
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

                  {/* Time Display */}
                  {appt.time && (
                    <div className="flex items-center gap-3 pr-10">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="bg-blue-100 p-2 rounded-lg"
                      >
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </motion.div>
                      <div>
                        <p className="text-xs text-textSoft font-medium">
                          الوقت
                        </p>
                        <p className="text-textMain font-bold">{appt.time}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
              {appt.location && (
                <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="bg-purple-100 p-2 rounded-lg"
                    >
                      <svg
                        className="w-5 h-5 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </motion.div>
                    <div>
                      <p className="text-xs text-textSoft font-medium">
                        الموقع
                      </p>
                      <p className="text-textMain text-sm">{appt.location}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Message */}
              {appt.message && (
                <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                  <p className="text-xs text-textSoft font-medium mb-1">
                    الرسالة
                  </p>
                  <p className="text-textMain text-sm">{appt.message}</p>
                </div>
              )}

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
                      disabled={paymentLoading === appt._id}
                      className="flex-1 bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-xl font-bold hover:from-secondary hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {paymentLoading === appt._id ? (
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
                        setSelectedAppointmentId(appt._id);
                        setShowCancelModal(true);
                      }}
                      disabled={paymentLoading === appt._id}
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
      </motion.div>

      {/* Cancel Modal */}
      <AnimatePresence>
        {showCancelModal && (
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
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all duration-300"
                >
                  تراجع
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={cancelAppointment}
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
