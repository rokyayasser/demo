/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";

const Dashboard = () => {
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    hover: {
      y: -5,
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="w-full max-w-7xl mx-auto p-4 sm:p-6"
      dir="rtl"
    >
      <motion.div variants={pageVariants} className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">لوحة التحكم</h1>
        <p className="text-textSoft text-lg">
          مرحباً بك في لوحة تحكم الخطيب فارما
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={pageVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {[
          {
            label: "إجمالي الخدمات",
            value: "24",
            color: "from-primary to-secondary",
            icon: "📊",
          },
          {
            label: "الحجوزات اليوم",
            value: "8",
            color: "from-green-500 to-emerald-600",
            icon: "📅",
          },
          {
            label: "الحجوزات النشطة",
            value: "15",
            color: "from-blue-500 to-cyan-500",
            icon: "✅",
          },
          {
            label: "إجمالي الإيرادات",
            value: "12,540",
            color: "from-purple-500 to-pink-500",
            icon: "💰",
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            whileHover="hover"
            className={`bg-gradient-to-r ${stat.color} text-white rounded-2xl p-6 shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-white/90">{stat.label}</p>
              </div>
              <motion.span
                className="text-3xl"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                {stat.icon}
              </motion.span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        variants={pageVariants}
        className="bg-white rounded-2xl shadow-lg p-6 border border-borderLight"
      >
        <h2 className="text-xl font-bold text-primary mb-4">إجراءات سريعة</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "إضافة خدمة جديدة",
              desc: "إضافة خدمة طبية جديدة إلى النظام",
              link: "/admin/add-service",
              color: "bg-gradient-to-r from-primary to-secondary",
            },
            {
              title: "عرض الحجوزات",
              desc: "عرض وإدارة جميع حجوزات المرضى",
              link: "/admin/appointments",
              color: "bg-gradient-to-r from-green-500 to-emerald-600",
            },
            {
              title: "إدارة الخدمات",
              desc: "عرض وتعديل وحذف الخدمات",
              link: "/admin/services-list",
              color: "bg-gradient-to-r from-blue-500 to-cyan-500",
            },
          ].map((action, index) => (
            <motion.a
              key={index}
              href={action.link}
              variants={cardVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`${action.color} text-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300`}
            >
              <h3 className="text-lg font-bold mb-2">{action.title}</h3>
              <p className="text-white/90 text-sm">{action.desc}</p>
              <motion.div className="mt-4 text-right" whileHover={{ x: 10 }}>
                →
              </motion.div>
            </motion.a>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
