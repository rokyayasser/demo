/* eslint-disable no-unused-vars */
import React from "react";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import DoctorNavbar from "./DoctorNavbar";
import DoctorSidebar from "./DoctorSidebar";

const DoctorLayout = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-screen bg-gray-50"
      dir="rtl"
    >
      <DoctorNavbar />
      <div className="flex flex-1 overflow-hidden">
        <DoctorSidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </motion.div>
  );
};

export default DoctorLayout;
