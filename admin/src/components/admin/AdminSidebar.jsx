/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  List,
  Lock,
  BookOpen,
  ShoppingBag,
  Users,
  ChevronRight,
  ChevronLeft,
  Package,
  FileText,
} from "lucide-react";

const menuSections = [
  {
    label: "عام",
    items: [
      {
        to: "/admin/dashboard",
        icon: LayoutDashboard,
        text: "الرئيسية",
        color: "from-violet-500 to-purple-600",
      },
      {
        to: "/admin/users",
        icon: Users,
        text: "المستخدمون",
        color: "from-slate-500 to-slate-600",
      },
    ],
  },
  {
    label: "المواعيد",
    items: [
      {
        to: "/admin/appointments",
        icon: Calendar,
        text: "جميع المواعيد",
        color: "from-green-500 to-emerald-600",
      },
      {
        to: "/admin/services",
        icon: List,
        text: "الخدمات",
        color: "from-purple-500 to-pink-600",
      },
      {
        to: "/admin/block-slots",
        icon: Lock,
        text: "حظر مواعيد",
        color: "from-red-500 to-orange-600",
      },
    ],
  },
  {
    label: "المحتوى",
    items: [
      {
        to: "/admin/courses",
        icon: BookOpen,
        text: "الكورسات",
        color: "from-indigo-500 to-blue-600",
      },
      {
        to: "/admin/products",
        icon: ShoppingBag,
        text: "المنتجات",
        color: "from-amber-500 to-yellow-600",
      },
      
    ],
  },
];

const AdminSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`relative bg-white border-l border-gray-200 h-full flex flex-col transition-all duration-300 ${
        isExpanded ? "w-64" : "w-20"
      }`}
    >
      <div className="flex-1 py-4 px-3 overflow-y-auto">
        {menuSections.map((section) => (
          <div key={section.label} className="mb-4">
            {isExpanded && (
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
                {section.label}
              </p>
            )}
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 mb-1 ${
                    isActive
                      ? `bg-gradient-to-r ${item.color} text-white shadow-md`
                      : "text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                <item.icon
                  className={`w-5 h-5 shrink-0 ${!isExpanded ? "mx-auto" : ""}`}
                />
                {isExpanded && (
                  <span className="font-medium text-sm">{item.text}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -left-3 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-full p-1 shadow-md hover:bg-gray-50 z-10"
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

export default AdminSidebar;
