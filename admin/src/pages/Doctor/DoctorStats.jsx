/* eslint-disable no-unused-vars */
import React, { useContext, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  XCircle,
  Users,
  TrendingUp,
  Star,
} from "lucide-react";
import { DoctorContext } from "../../context/DoctorContext";

const BAR_COLORS = {
  pending: "#fbbf24",
  confirmed: "#10b981",
  completed: "#3b82f6",
  cancelled: "#f87171",
};

const MiniBar = ({ value, max, color }) => (
  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: max > 0 ? `${(value / max) * 100}%` : "0%" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="h-2.5 rounded-full"
      style={{ backgroundColor: color }}
    />
  </div>
);

const DoctorStats = () => {
  const { doctorStats, getDoctorStats, loading } = useContext(DoctorContext);
  useEffect(() => {
    getDoctorStats();
  }, []);

  const s = doctorStats || {};
  const totalApts =
    (s.pending || 0) +
    (s.confirmed || 0) +
    (s.completed || 0) +
    (s.cancelled || 0);

  const statRows = [
    {
      label: "قيد الانتظار",
      key: "pending",
      icon: Clock,
      color: BAR_COLORS.pending,
    },
    {
      label: "مؤكدة",
      key: "confirmed",
      icon: CheckCircle,
      color: BAR_COLORS.confirmed,
    },
    {
      label: "مكتملة",
      key: "completed",
      icon: CheckCircle,
      color: BAR_COLORS.completed,
    },
    {
      label: "ملغية",
      key: "cancelled",
      icon: XCircle,
      color: BAR_COLORS.cancelled,
    },
  ];

  const cards = [
    {
      label: "إجمالي المواعيد",
      value: s.totalAppointments || totalApts,
      icon: Users,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "هذا الشهر",
      value: s.thisMonth || 0,
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
    },
    {
      label: "هذا الأسبوع",
      value: s.thisWeek || 0,
      icon: Clock,
      color: "from-violet-500 to-purple-500",
    },
    {
      label: "تقييم المرضى",
      value: s.rating ? `${s.rating.toFixed(1)} ★` : "—",
      icon: Star,
      color: "from-amber-500 to-yellow-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-gray-800">الإحصائيات</h1>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4"
          >
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-500 text-xs">{label}</p>
              <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Status breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
      >
        <h2 className="text-lg font-bold text-gray-800 mb-6">
          توزيع المواعيد حسب الحالة
        </h2>
        <div className="space-y-5">
          {statRows.map(({ label, key, icon: Icon, color }) => {
            const val = s[key] || 0;
            const pct = totalApts > 0 ? Math.round((val / totalApts) * 100) : 0;
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" style={{ color }} />
                    <span className="text-sm font-medium text-gray-700">
                      {label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-800">
                      {val}
                    </span>
                    <span className="text-xs text-gray-400">({pct}%)</span>
                  </div>
                </div>
                <MiniBar value={val} max={totalApts} color={color} />
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Monthly breakdown if available */}
      {s.monthly && s.monthly.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-6">
            المواعيد الشهرية
          </h2>
          <div className="flex items-end gap-2 h-32">
            {s.monthly.map(({ month, count }) => {
              const maxCount = Math.max(...s.monthly.map((m) => m.count), 1);
              const pct = (count / maxCount) * 100;
              return (
                <div
                  key={month}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${pct}%` }}
                    transition={{ duration: 0.6 }}
                    className="w-full bg-blue-500 rounded-t-md"
                    style={{ minHeight: count > 0 ? "4px" : 0 }}
                  />
                  <span className="text-xs text-gray-400">{month}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DoctorStats;
