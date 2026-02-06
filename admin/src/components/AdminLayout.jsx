/* eslint-disable no-unused-vars */
import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./SideBar";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";

const AdminLayout = () => {
  const pageVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
    exit: { opacity: 0 },
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col h-screen"
      dir="rtl"
    >
      {/* NAVBAR */}
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <Sidebar />

        {/* PAGE CONTENT */}
        <div className="flex-1 bg-lightBg overflow-y-auto p-4">
          <Outlet />
        </div>
      </div>
    </motion.div>
  );
};

export default AdminLayout;
