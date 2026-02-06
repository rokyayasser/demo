/* eslint-disable no-unused-vars */
import React from "react";
import { Calendar, Phone, Stethoscope, Clock } from "lucide-react";
import { assets } from "../../assets/assets";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const featureCardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "backOut",
      },
    },
    hover: {
      scale: 1.05,
      boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.15)",
      transition: {
        duration: 0.3,
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col lg:flex-row items-center justify-between gap-10 py-16 px-4 lg:px-20 bg-gradient-to-b from-white to-lightBg shadow-top-400 rounded-2xl"
    >
      {/* --- Left Side (Image) --- */}
      <motion.div variants={imageVariants} className="md:w-1/2">
        <motion.img
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="w-full h-max rounded-lg border-2 border-borderLight"
          src={assets.header_img}
          alt="Doctor"
        />
      </motion.div>

      {/* --- Right Side (Text & Features) --- */}
      <motion.div
        variants={containerVariants}
        className="w-full lg:w-1/2 text-end flex flex-col items-end gap-2"
      >
        {/* Headings */}
        <motion.h2
          variants={itemVariants}
          className="text-4xl md:text-5xl text-primary"
        >
          رعاية طبية
        </motion.h2>
        <motion.h3
          variants={itemVariants}
          className="text-4xl md:text-5xl text-secondary"
        >
          متقدمة وشاملة
        </motion.h3>
        <motion.p
          variants={itemVariants}
          className="text-textSoft text-xl max-w-md"
        >
          نقدم خدمات طبية عالية الجودة مع فريق من أفضل الأطباء المتخصصين لضمان
          صحتك وراحتك
        </motion.p>

        {/* Features */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <motion.div
            variants={featureCardVariants}
            whileHover="hover"
            className="flex flex-col justify-start items-end bg-white border border-borderLight rounded-2xl shadow-md hover:shadow-lg transition p-5 w-44 h-55 gap-5 cursor-pointer hover:border-secondary"
          >
            <motion.div
              whileHover={{ rotate: 10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Stethoscope className="text-primary mx-auto mb-2 w-10 h-10" />
            </motion.div>
            <p className="font-semibold text-textMain">أطباء متخصصون</p>
            <p className="text-textSoft text-sm mt-1">
              فريق من أفضل الأطباء ذوي الخبرة العالية
            </p>
          </motion.div>

          <motion.div
            variants={featureCardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            transition={{ delay: 0.1 }}
            className="flex flex-col justify-start items-end bg-white border border-borderLight rounded-2xl shadow-xl hover:shadow-lg transition p-5 w-44 h-55 gap-2 cursor-pointer hover:border-secondary"
          >
            <motion.div
              whileHover={{ rotate: 10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Clock className="text-secondary mx-auto mb-2 w-10 h-10" />
            </motion.div>
            <p className="font-semibold text-textMain">خدمة على مدار الساعة</p>
            <p className="text-textSoft text-sm mt-1">
              متاحون لخدمتك في أي وقت تحتاج إليه
            </p>
          </motion.div>

          <motion.div
            variants={featureCardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            transition={{ delay: 0.2 }}
            className="flex flex-col justify-start items-end bg-white border border-borderLight rounded-2xl shadow-xl hover:shadow-lg transition p-5 w-44 h-55 gap-5 cursor-pointer hover:border-secondary"
          >
            <motion.div
              whileHover={{ rotate: 10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Stethoscope className="text-primary mx-auto mb-2 w-10 h-10" />
            </motion.div>
            <p className="font-semibold text-textMain">أحدث التقنيات</p>
            <p className="text-textSoft text-sm mt-1">
              معدات طبية متطورة وتقنيات حديثة
            </p>
          </motion.div>
        </div>

        {/* Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex justify-end gap-4 mt-10"
        >
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "#F4EBC1" }}
            whileTap={{ scale: 0.95 }}
            className="border-2 border-primary text-primary px-6 py-3 rounded-full flex items-center gap-2 hover:bg-accent transition font-medium cursor-pointer"
          >
            <Phone className="w-5 h-5" /> اتصل بنا
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/medical-services")}
            className="bg-primary text-white px-6 py-3 rounded-full flex items-center gap-2 hover:bg-secondary transition font-medium cursor-pointer"
          >
            <Calendar className="w-5 h-5" /> احجز موعدك الآن
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.section>
  );
};

export default Header;
