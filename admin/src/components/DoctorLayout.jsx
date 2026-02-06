/* eslint-disable no-unused-vars */
import React from "react";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import DoctorSidebar from "./DoctorSidebar";
import DoctorNavbar from "./DoctorNavbar";

const DoctorLayout = () => {
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
      {/* DOCTOR NAVBAR */}
      <DoctorNavbar />

      <div className="flex flex-1 overflow-hidden">
        {/* DOCTOR SIDEBAR */}
        <DoctorSidebar />

        {/* PAGE CONTENT */}
        <div className="flex-1 bg-gradient-to-br from-blue-50 to-white overflow-y-auto p-4 md:p-6">
          <Outlet />
        </div>
      </div>
    </motion.div>
  );
};

export default DoctorLayout;
