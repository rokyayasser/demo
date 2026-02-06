/* eslint-disable no-unused-vars */
import React, { useContext } from "react";
import { AdminContext } from "../context/AdminContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Navbar = () => {
  const { aToken, setAToken } = useContext(AdminContext);
  const navigate = useNavigate();

  const logout = () => {
    setAToken("");
    localStorage.removeItem("aToken");
    setTimeout(() => navigate("/"), 100);
  };

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex justify-between items-center px-6 sm:px-10 py-4 border-b border-borderLight bg-white shadow-sm"
    >
      <div className="flex items-center gap-3">
        <motion.div
          whileHover={{ scale: 1.05, rotate: 5 }}
          className="bg-gradient-to-tr from-secondary to-primary p-2 rounded-lg"
        >
          <img
            src="https://img.icons8.com/ios-filled/50/ffffff/heart-with-pulse.png"
            alt="Logo"
            className="w-6 h-6"
          />
        </motion.div>

        <div className="text-right leading-tight">
          <h1 className="text-lg font-semibold text-textMain">
            الخطيب <span className="text-primary font-bold">فارما</span>
          </h1>
          <p className="text-xs text-secondary">لوحة التحكم</p>
        </div>
      </div>

      <motion.p
        whileHover={{ scale: 1.05 }}
        className="border border-borderLight bg-accent px-3 py-1 rounded-full text-primary text-xs font-medium"
      >
        {aToken ? "مدير النظام" : "طبيب"}
      </motion.p>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={logout}
        className="bg-primary text-white text-sm px-8 py-2 rounded-full hover:bg-secondary transition-all duration-300 font-medium"
      >
        تسجيل الخروج
      </motion.button>
    </motion.div>
  );
};

export default Navbar;
