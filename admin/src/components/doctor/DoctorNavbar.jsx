/* eslint-disable no-unused-vars */
import React, { useContext } from "react";
import { motion } from "framer-motion";
import { DoctorContext } from "../../context/DoctorContext";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Bell, Calendar, Stethoscope } from "lucide-react";

const DoctorNavbar = () => {
  const { doctorLogout } = useContext(DoctorContext);
  const navigate = useNavigate();

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
      className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm"
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">الخطيب فارما</h1>
            <p className="text-xs text-gray-500">لوحة الطبيب</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-xl">
          <Calendar className="w-4 h-4 text-blue-500" />
          <span className="text-sm text-gray-700">{currentDate}</span>
        </div>

        <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <User className="w-5 h-5 text-gray-600" />
          <span className="hidden md:block text-sm font-medium">د. الخطيب</span>
        </button>

        <button
          onClick={() => {
            doctorLogout();
            navigate("/");
          }}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:block text-sm">تسجيل الخروج</span>
        </button>
      </div>
    </motion.nav>
  );
};

export default DoctorNavbar;
