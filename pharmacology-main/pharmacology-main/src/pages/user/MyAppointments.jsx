/* eslint-disable no-unused-vars */
// pages/MyAppointments.jsx  (user side)
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import { AppContext } from "../../context/AppContext";
import api from "../../api/axios.config";

const STATUS = {
  pending: { ar: "قيد الانتظار", cls: "bg-yellow-100 text-yellow-800" },
  confirmed: { ar: "مؤكد", cls: "bg-green-100  text-green-800" },
  completed: { ar: "مكتمل", cls: "bg-blue-100   text-blue-800" },
  cancelled: { ar: "ملغي", cls: "bg-red-100    text-red-700" },
  no_show: { ar: "لم يحضر", cls: "bg-gray-100   text-gray-600" },
};

const MyAppointments = () => {
  const navigate = useNavigate();
  const { token, userData } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchAppointments();
  }, [token]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/v1/appointments/my-appointments");
      if (data.success) {
        const raw = data.data;
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.appointments)
            ? raw.appointments
            : [];
        setAppointments(list);
      }
    } catch (err) {
      console.error("fetchAppointments:", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center mt-32">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-[#9b61db] border-t-transparent" />
      </div>
    );

  return (
    <div className="min-h-screen mt-32 mb-20 px-4 sm:px-6 lg:px-10" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            مواعيدي
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {appointments.length} موعد
          </p>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">
              لا توجد مواعيد
            </h3>
            <p className="text-gray-400 mb-6">
              احجز موعدك الأول مع د. أحمد الخطيب
            </p>
            <button
              onClick={() => navigate("/consultations")}
              className="px-8 py-3 bg-gradient-to-r from-[#1e4b8f] to-[#9b61db] text-white rounded-xl font-bold"
            >
              احجز الآن
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt, i) => {
              const s = STATUS[apt.status] || STATUS.pending;
              const isOpen = expanded === apt._id;
              return (
                <motion.div
                  key={apt._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  {/* Header */}
                  <div
                    className="p-5 flex items-center justify-between cursor-pointer"
                    onClick={() => setExpanded(isOpen ? null : apt._id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#1e4b8f]/10 rounded-xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-[#1e4b8f]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">
                          {apt.service?.title_ar ||
                            apt.service?.title ||
                            apt.serviceId?.title_ar ||
                            "استشارة"}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {apt.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {apt.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium ${s.cls}`}
                      >
                        {s.ar}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-100 overflow-hidden"
                      >
                        <div className="p-5 space-y-3 text-sm">
                          {apt.service?.fees && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">سعر الخدمة</span>
                              <span className="font-bold text-[#9b61db]">
                                {apt.service.fees} جنيه
                              </span>
                            </div>
                          )}
                          {apt.paid !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">حالة الدفع</span>
                              <span
                                className={`font-medium ${apt.paid ? "text-green-600" : "text-orange-500"}`}
                              >
                                {apt.paid ? "تم الدفع ✓" : "لم يتم الدفع"}
                              </span>
                            </div>
                          )}
                          {apt.doctorNotes && (
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                              <p className="font-semibold text-amber-800 mb-1 text-xs">
                                ملاحظات الطبيب:
                              </p>
                              <p className="text-gray-700">{apt.doctorNotes}</p>
                            </div>
                          )}
                          {apt.status === "pending" && !apt.paid && (
                            <div className="bg-blue-50 rounded-xl p-3 text-blue-700 flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                              <p className="text-xs">
                                موعدك قيد المراجعة. سيتم تأكيده قريباً.
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
