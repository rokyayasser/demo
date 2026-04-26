/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Users,
  BarChart,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

const DoctorSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  const menuItems = [
    {
      to: "/doctor/calendar",
      icon: <Calendar className="w-5 h-5" />,
      text: "التقويم",
      color: "from-blue-500 to-cyan-600",
    },
    {
      to: "/doctor/today",
      icon: <Clock className="w-5 h-5" />,
      text: "مواعيد اليوم",
      color: "from-green-500 to-emerald-600",
    },
    {
      to: "/doctor/appointments",
      icon: <Users className="w-5 h-5" />,
      text: "جميع المواعيد",
      color: "from-purple-500 to-pink-600",
    },
    {
      to: "/doctor/stats",
      icon: <BarChart className="w-5 h-5" />,
      text: "الإحصائيات",
      color: "from-orange-500 to-red-600",
    },
  ];

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`relative bg-white border-l border-gray-200 h-full transition-all duration-300 ${
        isExpanded ? "w-72" : "w-20"
      }`}
    >
      <div className="py-6 px-3">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mb-1 ${
                isActive
                  ? `bg-gradient-to-r ${item.color} text-white shadow-md`
                  : "text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            <div className={`${!isExpanded ? "mx-auto" : ""}`}>{item.icon}</div>
            {isExpanded && <span className="font-medium">{item.text}</span>}
          </NavLink>
        ))}
      </div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -left-3 top-1/2 transform -translate-y-1/2 bg-white border border-gray-200 rounded-full p-1 shadow-md hover:bg-gray-50"
      >
        {isExpanded ? (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        )}
      </button>
    </motion.div>
  );
};

export default DoctorSidebar;
