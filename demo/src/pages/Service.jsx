/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { motion } from "framer-motion";
import { MedicalContext } from "../context/MedicalContext";

const Service = () => {
  const { category } = useParams();
  const { Medicalservices } = useContext(MedicalContext);
  const navigate = useNavigate();

  const [filteredServices, setFilteredServices] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(true);

  const pageVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
    exit: { opacity: 0 },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    hover: {
      y: -10,
      scale: 1.02,
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
      transition: {
        duration: 0.3,
      },
    },
  };

  // Get unique categories
  const uniqueCategories = Array.from(
    new Map(Medicalservices.map((s) => [s.category, s.category_ar])).entries()
  );

  // Apply filter
  const applyFilter = () => {
    setLoading(true);
    let filtered = Medicalservices;

    if (category) {
      filtered = filtered.filter(
        (s) => s.category.toLowerCase() === category.toLowerCase()
      );
    }

    setFilteredServices(filtered);
    setLoading(false);
  };

  useEffect(() => {
    applyFilter();
  }, [category, Medicalservices]);

  if (loading && Medicalservices.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-textSoft text-lg">جاري تحميل الخدمات...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="my-12 px-4 sm:px-6 text-textMain"
      dir="rtl"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="text-center mb-12 max-w-3xl mx-auto"
      >
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl md:text-4xl font-bold text-primary mb-4"
        >
          خدماتنا الطبية
        </motion.h1>
        <motion.p
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-textSoft text-lg"
        >
          تصفح جميع الخدمات الطبية حسب التخصص
        </motion.p>

        {/* Availability Legend */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-2xl mx-auto"
        >
          <h4 className="font-bold text-blue-700 mb-2">مفتاح الحالة:</h4>
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-blue-600">متاح للحجز</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-blue-600">غير متاح حالياً</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
        {/* Mobile Filter Toggle */}
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`py-3 px-6 rounded-xl text-base lg:hidden transition-all flex items-center justify-center gap-2 font-bold ${
            showFilter
              ? "bg-primary text-white shadow-lg"
              : "bg-white text-textMain border-2 border-primary"
          }`}
          onClick={() => setShowFilter((prev) => !prev)}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          الفلاتر {showFilter ? "▲" : "▼"}
        </motion.button>

        {/* Filter Section */}
        <motion.div
          variants={itemVariants}
          className={`lg:w-1/4 ${showFilter ? "block" : "hidden lg:block"}`}
        >
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-borderLight sticky top-24">
            <h3 className="text-xl font-bold text-primary mb-6 pb-3 border-b border-borderLight flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              جميع التخصصات
            </h3>
            <div className="space-y-3">
              <motion.div variants={itemVariants}>
                <div
                  onClick={() => navigate("/medical-services")}
                  className={`w-full text-right py-3 px-4 rounded-xl cursor-pointer transition-all duration-300 flex items-center justify-between ${
                    !category
                      ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg font-bold"
                      : "bg-lightBg text-textMain hover:bg-accent"
                  }`}
                >
                  <span>جميع الخدمات</span>
                  {!category && (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </motion.div>

              {uniqueCategories.map(([catEn, catAr], index) => (
                <motion.div
                  key={catEn}
                  variants={itemVariants}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div
                    onClick={() =>
                      category === catEn
                        ? navigate("/medical-services")
                        : navigate(`/medical-services/${catEn}`)
                    }
                    className={`w-full text-right py-3 px-4 rounded-xl cursor-pointer transition-all duration-300 flex items-center justify-between ${
                      category === catEn
                        ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg font-bold"
                        : "bg-lightBg text-textMain hover:bg-accent"
                    }`}
                  >
                    <span>{catAr}</span>
                    {category === catEn && (
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Services Grid */}
        <motion.div variants={itemVariants} className="lg:w-3/4">
          {filteredServices.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-lightBg rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-textSoft"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-textMain mb-2">
                لا توجد خدمات
              </h3>
              <p className="text-textSoft">
                لم يتم العثور على خدمات في هذا التخصص
              </p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredServices.map((item, index) => (
                <motion.div
                  key={item._id}
                  variants={cardVariants}
                  whileHover="hover"
                  className={`relative border border-borderLight rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ${
                    !item.available ? "opacity-80" : ""
                  }`}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Unavailable Overlay */}
                  {!item.available && (
                    <>
                      <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-[1px] z-10"></div>
                      <div className="absolute top-4 left-4 z-20">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
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
                    </>
                  )}

                  <div className="relative h-56 overflow-hidden">
                    <motion.img
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                      className={`w-full h-full object-cover ${
                        !item.available ? "grayscale" : ""
                      }`}
                      src={item.image}
                      alt={item.title}
                    />
                    <div
                      className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold shadow-lg ${
                        item.available
                          ? "bg-primary text-white"
                          : "bg-gray-400 text-gray-100"
                      }`}
                    >
                      {item.category_ar}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-textMain flex-1">
                        {item.title}
                      </h3>
                      {/* Availability Indicator */}
                      <div
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                          item.available
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            item.available ? "bg-green-500" : "bg-red-500"
                          }`}
                        ></div>
                        <span>{item.available ? "متاح" : "غير متاح"}</span>
                      </div>
                    </div>

                    <p className="text-textSoft text-sm leading-relaxed mb-4 line-clamp-2">
                      {item.description}
                    </p>

                    {/* Features */}
                    <ul className="text-textSoft text-sm space-y-2 mb-5">
                      {item.features.slice(0, 3).map((feature, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className={`flex items-center gap-2 transition-colors ${
                            !item.available
                              ? "text-gray-400"
                              : "hover:text-secondary"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              !item.available ? "bg-gray-400" : "bg-primary"
                            }`}
                          ></div>
                          <span>{feature}</span>
                        </motion.li>
                      ))}
                    </ul>

                    <div className="flex items-center justify-between mb-6">
                      <motion.span
                        whileHover={{ scale: 1.1 }}
                        className={`font-bold text-2xl ${
                          !item.available
                            ? "text-gray-500 line-through"
                            : "text-primary"
                        }`}
                      >
                        {item.fees} جنيه
                      </motion.span>
                      <span
                        className={`text-sm ${
                          !item.available ? "text-gray-400" : "text-textSoft"
                        }`}
                      >
                        {item.duration || "30 دقيقة"}
                      </span>
                    </div>

                    <motion.button
                      whileHover={item.available ? { scale: 1.05 } : {}}
                      whileTap={item.available ? { scale: 0.95 } : {}}
                      onClick={() => {
                        if (item.available) {
                          navigate(`/appointment/${item._id}`);
                        }
                      }}
                      disabled={!item.available}
                      className={`w-full text-base font-bold py-3 rounded-xl transition-all duration-300 shadow-lg ${
                        item.available
                          ? "bg-gradient-to-r from-primary to-secondary text-white hover:from-secondary hover:to-primary hover:shadow-xl cursor-pointer"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {item.available ? "حجز موعد" : "غير متاح للحجز"}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

// Add missing variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default Service;
