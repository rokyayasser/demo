/* eslint-disable no-unused-vars */
import React, { useContext, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  BookOpen,
  ShoppingBag,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { AdminContext } from "../../context/AdminContext";

const StatCard = ({ icon: Icon, label, value, sub, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5"
  >
    <div
      className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${color}`}
    >
      <Icon className="w-7 h-7 text-white" />
    </div>
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-3xl font-bold text-gray-800">{value ?? "—"}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </motion.div>
);

const Dashboard = () => {
  const {
    dashStats,
    getDashboardStats,
    appointments,
    getAppointments,
    loading,
  } = useContext(AdminContext);
  const navigate = useNavigate();

  useEffect(() => {
    getDashboardStats();
    getAppointments({ limit: 5, sort: "-createdAt" });
  }, []);

  const s = dashStats || {};

  const cards = [
    {
      icon: Calendar,
      label: "إجمالي المواعيد",
      value: s.totalAppointments,
      sub: `${s.pendingAppointments || 0} قيد الانتظار`,
      color: "from-violet-500 to-purple-600",
      delay: 0,
    },
    {
      icon: BookOpen,
      label: "الكورسات",
      value: s.totalCourses,
      sub: `${s.totalEnrollments || 0} اشتراك`,
      color: "from-blue-500 to-cyan-600",
      delay: 0.05,
    },
    {
      icon: ShoppingBag,
      label: "المنتجات",
      value: s.totalProducts,
      sub: `${s.totalOrders || 0} طلب`,
      color: "from-amber-500 to-yellow-500",
      delay: 0.1,
    },
    {
      icon: Users,
      label: "المستخدمون",
      value: s.totalUsers,
      sub: `${s.newUsersThisMonth || 0} هذا الشهر`,
      color: "from-green-500 to-emerald-600",
      delay: 0.15,
    },
    {
      icon: TrendingUp,
      label: "الإيرادات",
      value: s.totalRevenue ? `${s.totalRevenue.toLocaleString()} جنيه` : "—",
      color: "from-rose-500 to-pink-600",
      delay: 0.2,
    },
  ];

  const recentAppointments = appointments.slice(0, 5);

  const statusStyle = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-green-100 text-green-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
  };
  const statusAr = {
    pending: "قيد الانتظار",
    confirmed: "مؤكد",
    completed: "مكتمل",
    cancelled: "ملغي",
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-gray-800">لوحة التحكم</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString("ar-EG", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {cards.map((c) => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>

      {/* Appointment status mini-summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "قيد الانتظار",
            value: s.pendingAppointments,
            icon: Clock,
            cls: "text-yellow-600 bg-yellow-50",
          },
          {
            label: "مؤكدة",
            value: s.confirmedAppointments,
            icon: CheckCircle,
            cls: "text-green-600 bg-green-50",
          },
          {
            label: "مكتملة",
            value: s.completedAppointments,
            icon: CheckCircle,
            cls: "text-blue-600 bg-blue-50",
          },
          {
            label: "ملغية",
            value: s.cancelledAppointments,
            icon: XCircle,
            cls: "text-red-600 bg-red-50",
          },
        ].map(({ label, value, icon: Icon, cls }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-2xl p-5 flex items-center gap-3 ${cls}`}
          >
            <Icon className="w-6 h-6" />
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-2xl font-bold">{value ?? 0}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent appointments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">أحدث المواعيد</h2>
          <button
            onClick={() => navigate("/admin/appointments")}
            className="text-sm text-violet-600 hover:underline"
          >
            عرض الكل
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-violet-500 border-t-transparent" />
          </div>
        ) : recentAppointments.length === 0 ? (
          <p className="text-center text-gray-400 py-12">
            لا توجد مواعيد حتى الآن
          </p>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentAppointments.map((apt) => (
              <div
                key={apt._id}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    {apt.name || `${apt.firstName} ${apt.lastName}`}
                  </p>
                  <p className="text-sm text-gray-500">
                    {apt.service?.title_ar || apt.category || "—"} · {apt.date}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">{apt.time}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle[apt.status] || "bg-gray-100 text-gray-600"}`}
                  >
                    {statusAr[apt.status] || apt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
