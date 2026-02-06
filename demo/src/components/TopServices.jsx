/* eslint-disable no-unused-vars */
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";

import { motion } from "framer-motion";
import { MedicalContext } from "../context/MedicalContext";

const TopServices = () => {
  const navigate = useNavigate();
  const { Medicalservices = [], loading } = useContext(MedicalContext);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
      },
    },
    hover: {
      scale: 1.03,
      y: -8,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.5,
      },
    },
    hover: {
      scale: 1.05,
      boxShadow: "0px 5px 15px rgba(109, 40, 217, 0.3)",
      transition: {
        duration: 0.2,
      },
    },
  };

  // Show loading state or empty state
  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 my-16 text-textMain md:mx-10">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
        <p className="text-textSoft text-lg">جاري تحميل الخدمات...</p>
      </div>
    );
  }

  // Check if Medicalservices is defined and is an array
  const servicesToShow = Array.isArray(Medicalservices)
    ? Medicalservices.slice(0, 8)
    : [];

  if (servicesToShow.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 my-16 text-textMain md:mx-10">
        <h1 className="text-3xl font-bold text-primary">
          الخدمات الطبية الأكثر طلباً
        </h1>
        <p className="text-textSoft">لا توجد خدمات متاحة حالياً</p>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="flex flex-col items-center gap-4 my-16 text-textMain md:mx-10"
    >
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-3xl font-bold text-primary"
      >
        الخدمات الطبية الأكثر طلباً
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
        className="sm:w-1/2 text-center text-textSoft text-sm leading-relaxed"
      >
        تصفح قائمة خدماتنا الطبية الموثوقة والمتميزة
      </motion.p>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-5 px-3 sm:px-0"
      >
        {servicesToShow.map((item, index) => (
          <motion.div
            variants={cardVariants}
            whileHover={item?.available ? "hover" : {}}
            onClick={() => {
              if (item?.available) {
                navigate(`/appointment/${item._id}`);
                window.scrollTo(0, 0);
              }
            }}
            className={`relative border border-borderLight rounded-xl overflow-hidden ${
              item?.available
                ? "cursor-pointer bg-white shadow-sm hover:shadow-lg hover:border-secondary"
                : "cursor-not-allowed bg-gray-50 opacity-80"
            }`}
            key={item?._id || index}
          >
            {/* Unavailable Badge */}
            {!item?.available && (
              <div className="absolute top-2 left-2 z-10">
                <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  غير متاح
                </span>
              </div>
            )}

            <motion.div
              whileHover={{ scale: item?.available ? 1.05 : 1 }}
              transition={{ duration: 0.3 }}
              className="bg-lightBg w-full h-48 overflow-hidden"
            >
              <img
                className={`w-full h-full object-contain p-6 ${
                  !item?.available ? "grayscale" : ""
                }`}
                src={item?.image}
                alt={item?.title || "خدمة طبية"}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/300x200?text=Service+Image";
                }}
              />
            </motion.div>

            <div className="p-4">
              <div className="flex items-center gap-2 text-sm mb-2">
                <div
                  className={`flex items-center gap-1 ${
                    item?.available ? "text-green-500" : "text-red-500"
                  }`}
                >
                  <motion.div
                    animate={item?.available ? { scale: [1, 1.2, 1] } : {}}
                    transition={
                      item?.available ? { repeat: Infinity, duration: 2 } : {}
                    }
                    className={`w-2 h-2 rounded-full ${
                      item?.available ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></motion.div>
                  <p>{item?.available ? "متاح" : "غير متاح"}</p>
                </div>
              </div>

              <p
                className={`text-lg font-semibold mb-1 ${
                  !item?.available ? "text-gray-500" : "text-textMain"
                }`}
              >
                {item?.title || "خدمة غير محددة"}
              </p>
              <p
                className={`text-sm mb-2 ${
                  !item?.available ? "text-gray-400" : "text-textSoft"
                }`}
              >
                {item?.category_ar || "غير مصنف"}
              </p>

              <div className="flex items-center justify-between mt-3">
                <motion.span
                  whileHover={{ scale: item?.available ? 1.1 : 1 }}
                  className={`font-bold ${
                    !item?.available
                      ? "text-gray-500 line-through"
                      : "text-primary"
                  }`}
                >
                  {item?.fees || 0} جنيه
                </motion.span>
                <span
                  className={`text-xs ${
                    !item?.available ? "text-gray-400" : "text-textSoft"
                  }`}
                >
                  {item?.duration || "30 دقيقة"}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.button
        variants={buttonVariants}
        initial="hidden"
        whileInView="visible"
        whileHover="hover"
        onClick={() => {
          navigate("/medical-services");
          window.scrollTo(0, 0);
        }}
        className="bg-accent text-primary px-12 py-3 rounded-full mt-10 font-medium hover:bg-secondary hover:text-white transition-all duration-300 border border-borderLight"
      >
        عرض المزيد
      </motion.button>
    </div>
  );
};

export default TopServices;
