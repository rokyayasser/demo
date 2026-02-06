/* eslint-disable no-unused-vars */
import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminContext } from "../../context/AdminContext";
import { motion, AnimatePresence } from "framer-motion";

const ServicesList = () => {
  const {
    services,
    aToken,
    getAllServices,
    changeServiceAvailability,
    deleteService,
  } = useContext(AdminContext);

  const navigate = useNavigate();

  useEffect(() => {
    if (aToken) {
      getAllServices();
    }
  }, [aToken]);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    hover: {
      y: -5,
      boxShadow: "0 15px 40px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.3 },
    },
    exit: { opacity: 0, scale: 0.9 },
  };

  const handleEdit = (serviceId) => {
    navigate(`/admin/edit-service/${serviceId}`);
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="m-5 max-h-[90vh] overflow-y-scroll"
      dir="rtl"
    >
      <motion.h1
        variants={pageVariants}
        className="text-2xl font-bold text-primary mb-6 text-center"
      >
        جميع الخدمات الطبية
      </motion.h1>

      <div className="w-full flex flex-wrap gap-4 pt-5 gap-y-6 justify-center">
        <AnimatePresence>
          {services.map((item, index) => (
            <motion.div
              key={item._id}
              variants={cardVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              whileHover="hover"
              className={`relative border border-borderLight rounded-xl overflow-hidden cursor-pointer bg-white w-64 ${
                !item.available ? "opacity-70" : ""
              }`}
            >
              {/* Availability Badge - FIXED POSITIONING */}
              {!item.available && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold z-10 shadow-lg"
                >
                  غير متاح
                </motion.div>
              )}

              <motion.div
                className="relative bg-lightBg w-full h-48 overflow-hidden"
                whileHover={{ scale: 1.05 }}
              >
                <img
                  className="w-full h-full object-contain p-4"
                  src={item.image}
                  alt={item.title}
                />
              </motion.div>

              <div className="p-4">
                <motion.p
                  whileHover={{ color: "#3b82f6" }}
                  className="text-textMain text-lg font-medium mb-1"
                >
                  {item.title_ar}
                </motion.p>
                <p className="text-textSoft text-sm mb-2">{item.category_ar}</p>
                <p className="text-primary font-bold mb-3">{item.fees} جنيه</p>

                <div className="flex items-center justify-between mt-4">
                  <motion.div
                    className="flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => changeServiceAvailability(item._id)}
                      className={`relative w-10 h-5 rounded-full cursor-pointer transition-all duration-300 ${
                        item.available ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      <motion.div
                        className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${
                          item.available ? "right-1" : "left-1"
                        }`}
                        layout
                      />
                    </motion.button>
                    <p
                      className={`text-sm font-medium ${
                        item.available ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {item.available ? "متاح" : "غير متاح"}
                    </p>
                  </motion.div>

                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEdit(item._id)}
                      className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-all text-sm"
                    >
                      تعديل
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (window.confirm("هل أنت متأكد من حذف هذه الخدمة؟")) {
                          deleteService(item._id);
                        }
                      }}
                      className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-all text-sm"
                    >
                      حذف
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ServicesList;
