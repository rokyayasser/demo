/* eslint-disable no-unused-vars */
import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { AdminContext } from "../context/AdminContext";
import { assets } from "../assets/assets";
import { motion } from "framer-motion";
import {
  Home,
  Calendar,
  PlusSquare,
  List,
  BookOpen,
  Video,
  Users,
  BarChart,
  Settings,
  LogOut,
} from "lucide-react";

const SideBar = () => {
  const { aToken, adminLogout } = useContext(AdminContext);

  const sidebarVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  };

  const menuItems = [
    {
      to: "/admin/dashboard",
      icon: <Home size={20} />,
      text: "الرئيسية",
    },
    {
      to: "/admin/appointments",
      icon: <Calendar size={20} />,
      text: "الحجوزات",
    },
    {
      to: "/admin/courses",
      icon: <BookOpen size={20} />,
      text: "الدورات",
    },
    {
      to: "/admin/add-service",
      icon: <PlusSquare size={20} />,
      text: "إضافة خدمة",
    },
    {
      to: "/admin/services-list",
      icon: <List size={20} />,
      text: "قائمة الخدمات",
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
      className="w-72 min-w-72 bg-white border-r border-borderLight shadow-lg pt-8 overflow-y-auto flex flex-col h-full"
      dir="rtl"
    >
      {/* Logo */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
            <img
              src="https://img.icons8.com/ios-filled/50/ffffff/heart-with-pulse.png"
              alt="Logo"
              className="w-6 h-6"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary">لوحة التحكم</h2>
            <p className="text-xs text-textSoft">الخطيب فارما</p>
          </div>
        </div>
      </div>

      {aToken && (
        <>
          {/* Main Menu */}
          <div className="flex-1 px-3">
            <ul className="flex flex-col gap-1">
              {menuItems.map((item, index) => (
                <motion.li key={index} variants={itemVariants}>
                  <NavLink
                    to={item.disabled ? "#" : item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 mx-2
                      ${
                        isActive
                          ? "bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border-r-4 border-primary"
                          : item.disabled
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-gray-50 hover:text-primary"
                      }`
                    }
                    onClick={(e) => item.disabled && e.preventDefault()}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        window.location.pathname === item.to
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.icon}
                    </div>
                    <p className="font-medium">{item.text}</p>
                    {item.disabled && (
                      <span className="text-xs text-gray-400">قريباً</span>
                    )}
                  </NavLink>
                </motion.li>
              ))}
            </ul>

            {/* Course Management Section */}
            <div className="mt-8 mb-4 px-4">
              <h3 className="text-sm font-bold text-textSoft uppercase mb-3 px-2">
                إدارة الدورات
              </h3>
              <ul className="flex flex-col gap-1">
                <motion.li variants={itemVariants}>
                  <NavLink
                    to="/admin/courses"
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300
                      ${
                        isActive
                          ? "bg-primary text-white"
                          : "hover:bg-gray-100 hover:text-primary"
                      }`
                    }
                  >
                    <BookOpen size={18} />
                    <span>جميع الدورات</span>
                  </NavLink>
                </motion.li>
                <motion.li variants={itemVariants}>
                  <NavLink
                    to="#"
                    onClick={(e) => {
                      e.preventDefault();
                      // يمكنك فتح modal لإضافة دورة هنا
                      document.getElementById("add-course-btn")?.click();
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 hover:bg-gray-100 hover:text-primary cursor-pointer"
                  >
                    <PlusSquare size={18} />
                    <span>إضافة دورة جديدة</span>
                  </NavLink>
                </motion.li>
              </ul>
            </div>
          </div>

          {/* Logout Button */}
          <div className="p-4 border-t border-borderLight">
            <button
              onClick={adminLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-300"
            >
              <LogOut size={20} />
              <span className="font-medium">تسجيل الخروج</span>
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default SideBar;
