/* eslint-disable no-unused-vars */
import React from "react";
import { CalendarDays, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Banner = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)",
      transition: {
        duration: 0.2,
      },
    },
    tap: {
      scale: 0.95,
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
      className="bg-primary text-center text-white rounded-lg py-10 px-4 flex flex-col items-center gap-4 my-15 relative overflow-hidden"
    >
      {/* Animated background elements */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 left-0 w-40 h-40 rounded-full border-2 border-white/10 -translate-x-20 -translate-y-20"
      ></motion.div>
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-0 right-0 w-60 h-60 rounded-full border-2 border-white/10 translate-x-20 translate-y-20"
      ></motion.div>

      <motion.h2 variants={itemVariants} className="text-2xl font-bold z-10">
        هل تحتاج لاستشارة طبية؟
      </motion.h2>
      <motion.p variants={itemVariants} className="text-accent z-10">
        احجز موعدك الآن مع أفضل الأطباء المتخصصين
      </motion.p>

      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row gap-4 mt-4 z-10"
      >
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={() => navigate("/medical-services")}
          className="flex items-center justify-center gap-2 bg-secondary hover:bg-accent hover:text-primary transition text-white font-semibold py-2 px-6 rounded-md"
        >
          <motion.div
            whileHover={{ rotate: 15 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <CalendarDays size={18} />
          </motion.div>
          احجز أونلاين
        </motion.button>

        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          className="flex items-center justify-center gap-2 bg-white hover:bg-lightBg transition text-primary font-semibold py-2 px-6 rounded-md"
        >
          <motion.div
            whileHover={{ rotate: 15 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Phone size={18} />
          </motion.div>
          اتصل الآن
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default Banner;
