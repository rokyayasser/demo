/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from "react";

import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  FiUsers,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiTrendingUp,
} from "react-icons/fi";
import { DoctorContext } from "../../context/DoctorContext";

const DoctorStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");
  const { backendUrl, dToken } = useContext(DoctorContext);

  const fetchStats = async () => {
    setLoading(true);
    try {
      console.log("Fetching stats from:", `${backendUrl}/api/doctor/stats`);

      const response = await axios.get(`${backendUrl}/api/doctor/stats`, {
        headers: { token: dToken },
      });

      console.log("Stats API response:", response.data);

      if (response.data.success) {
        setStats(response.data.stats);

        // Set debug info
        if (response.data.debug) {
          setDebugInfo(`
            Total: ${response.data.debug.totalAppointments}, 
            Paid: ${response.data.debug.paidAppointments}, 
            With Amount: ${response.data.debug.appointmentsWithAmount}, 
            With Fees: ${response.data.debug.appointmentsWithServiceFees}
          `);
        }

        toast.success("تم تحميل الإحصائيات بنجاح");
      } else {
        toast.error("فشل في تحميل الإحصائيات: " + response.data.message);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("فشل في تحميل الإحصائيات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [dToken]);

  // Refresh stats manually
  const refreshStats = () => {
    fetchStats();
  };

  const statCards = [
    {
      title: "إجمالي المواعيد",
      value: stats?.totalAppointments || 0,
      icon: FiUsers,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      subtitle: "جميع المواعيد المسجلة",
    },
    {
      title: "اليوم",
      value: stats?.todayAppointments || 0,
      icon: FiCalendar,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      subtitle: "مواعيد اليوم فقط",
    },
    {
      title: "هذا الأسبوع",
      value: stats?.weekAppointments || 0,
      icon: FiTrendingUp,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      subtitle: "آخر 7 أيام",
    },
    {
      title: "هذا الشهر",
      value: stats?.monthAppointments || 0,
      icon: FiCalendar,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      subtitle: "آخر 30 يوم",
    },
    {
      title: "مكتملة",
      value: stats?.completedAppointments || 0,
      icon: FiCheckCircle,
      color: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50",
      subtitle: "تم إكمالها",
    },
    {
      title: "قيد الانتظار",
      value: stats?.pendingAppointments || 0,
      icon: FiClock,
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      subtitle: "في انتظار التأكيد",
    },
    {
      title: "مؤكدة",
      value: stats?.confirmedAppointments || 0,
      icon: FiCheckCircle,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      subtitle: "تم تأكيدها",
    },
    {
      title: "إجمالي الإيرادات",
      value: `${stats?.totalRevenue?.toLocaleString() || 0} ج.م`,
      icon: FiDollarSign,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      subtitle: "من المواعيد المدفوعة",
    },
  ];

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="text-gray-600">جارٍ تحميل الإحصائيات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              الإحصائيات
            </h1>
            <p className="text-gray-600">نظرة عامة على أداء العيادة</p>
            {debugInfo && (
              <p className="text-xs text-gray-500 mt-2">تصحيح: {debugInfo}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={refreshStats}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <FiTrendingUp className="w-5 h-5" />
              تحديث الإحصائيات
            </button>
          </div>
        </div>

        {stats && (
          <div className="mt-4 text-sm text-gray-500">
            آخر تحديث: {new Date().toLocaleString("ar-EG")}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${stat.bgColor} rounded-xl p-6 shadow border border-gray-100`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-gray-600 font-medium">
                {stat.title}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-2">
              {stat.value}
            </div>
            {stat.subtitle && (
              <div className="text-sm text-gray-500">{stat.subtitle}</div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Completion Rate & Average Daily */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Completion Rate */}
        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-lg font-bold text-gray-800 mb-4">معدل الإكمال</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-teal-400 transition-all duration-500"
                  style={{ width: `${stats?.completionRate || 0}%` }}
                ></div>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {stats?.completionRate || 0}%
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            نسبة المواعيد المكتملة إلى إجمالي المواعيد
          </p>
        </div>

        {/* Average Daily */}
        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            المتوسط اليومي
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      ((stats?.averageDaily || 0) / 10) * 100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {stats?.averageDaily || 0}
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            متوسط عدد المواعيد يومياً
          </p>
        </div>
      </div>

      {/* Debug Info - Only show if stats are 0 */}
      {(stats?.weekAppointments === 0 ||
        stats?.monthAppointments === 0 ||
        stats?.totalRevenue === 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h4 className="text-yellow-800 font-bold mb-2">ملاحظة:</h4>
          <p className="text-yellow-700 text-sm">
            بعض الإحصائيات تظهر صفر. قد يكون بسبب:
          </p>
          <ul className="text-yellow-700 text-sm list-disc list-inside mt-1">
            <li>لا توجد مواعيد في الأسبوع/الشهر الماضي</li>
            <li>المواعيد القديمة لا تحتوي على تواريخ قابلة للتحليل</li>
            <li>المواعيد المدفوعة لا تحتوي على مبالغ مسجلة</li>
            <li>تحقق من سجلات وحدة التحكم لمزيد من التفاصيل</li>
          </ul>
          <button
            onClick={refreshStats}
            className="mt-3 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm"
          >
            إعادة المحاولة
          </button>
        </div>
      )}
    </div>
  );
};

export default DoctorStats;
