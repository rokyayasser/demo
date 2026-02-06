/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";

const DoctorNavbar = () => {
  const currentDate = new Date().toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-400 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm font-bold">👨‍⚕️</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">لوحة الطبيب</h1>
          <p className="text-sm text-gray-500">{currentDate}</p>
        </div>
      </div>
    </motion.nav>
  );
};

export default DoctorNavbar;
