/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useContext } from "react";
import { DoctorContext } from "../context/DoctorContext";
import { toast } from "react-toastify";

const DoctorSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);
  const { setDToken } = useContext(DoctorContext);

  const menuItems = [
    {
      name: "التقويم",
      icon: "📅",
      path: "/doctor/calendar",
      color: "text-blue-600",
    },
    {
      name: "اليوم",
      icon: "📋",
      path: "/doctor/today",
      color: "text-green-600",
    },
    {
      name: "جميع المواعيد",
      icon: "👥",
      path: "/doctor/appointments",
      color: "text-purple-600",
    },
    {
      name: "الإحصائيات",
      icon: "📊",
      path: "/doctor/stats",
      color: "text-orange-600",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("dToken");
    setDToken("");
    toast.success("تم تسجيل الخروج بنجاح");
    navigate("/"); // Change this to navigate to the main login page
  };

  return (
    <motion.div
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      className={`flex flex-col bg-white border-l border-gray-200 h-full transition-all duration-300 ${
        isExpanded ? "w-64" : "w-20"
      }`}
    >
      {/* Profile Section */}

      {/* Menu Items */}
      <div className="flex-1 py-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200 ${
              location.pathname === item.path
                ? "bg-blue-50 text-blue-700 border-r-4 border-blue-500"
                : "hover:bg-gray-50"
            }`}
          >
            <span className={`text-xl ${item.color}`}>{item.icon}</span>
            {isExpanded && (
              <span className="font-medium text-gray-700">{item.name}</span>
            )}
          </Link>
        ))}
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 rounded-lg transition-all duration-200 text-red-600 font-medium"
        >
          <span className="text-xl">🚪</span>
          {isExpanded && <span>تسجيل الخروج</span>}
        </button>
      </div>

      {/* Expand/Collapse Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute top-1/2 left-0 transform -translate-y-1/2 translate-x-1/2 bg-white border border-gray-300 rounded-full w-6 h-10 flex items-center justify-center hover:bg-gray-50"
      >
        {isExpanded ? "◀" : "▶"}
      </button>
    </motion.div>
  );
};

export default DoctorSidebar;
