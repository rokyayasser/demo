/* eslint-disable no-unused-vars */

// export default About;
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <div
        dir="rtl"
        className="flex flex-col items-center gap-4 my-16 text-textMain md:mx-10"
        id="about-us"
      >
        {/* === Title Section === */}
        <h1 className="text-3xl font-bold text-primary">من نحن</h1>
        <p className="sm:w-1/2 text-center text-textSoft text-sm leading-relaxed">
          نحن مؤسسة طبية رائدة تقدم أفضل الخدمات الصحية وأحدث التقنيات لضمان صحة
          وسلامة مرضانا.
        </p>

        {/* === Vision and Mission === */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-8 px-4 sm:px-0">
          <div className="bg-lightBg rounded-2xl shadow-md hover:shadow-lg transition-all duration-500 p-6 flex flex-col justify-between border border-borderLight">
            <h2 className="text-xl font-bold text-center text-primary mb-2">
              رؤيتنا
            </h2>
            <p className="text-center text-textSoft text-sm mb-3 leading-snug">
              نسعى لأن نكون الخيار الأول في تقديم الرعاية الصحية المتميزة.
            </p>
          </div>

          <div className="bg-lightBg rounded-2xl shadow-md hover:shadow-lg transition-all duration-500 p-6 flex flex-col justify-between border border-borderLight">
            <h2 className="text-xl font-bold text-center text-primary mb-2">
              رسالتنا
            </h2>
            <p className="text-center text-textSoft text-sm mb-3 leading-snug">
              تقديم خدمات طبية متكاملة باستخدام أحدث التقنيات وأعلى معايير
              الجودة.
            </p>
          </div>

          <div className="bg-lightBg rounded-2xl shadow-md hover:shadow-lg transition-all duration-500 p-6 flex flex-col justify-between border border-borderLight">
            <h2 className="text-xl font-bold text-center text-primary mb-2">
              قيمنا الأساسية
            </h2>
            <ul className="text-textSoft text-sm space-y-1 mb-3 list-none pr-2">
              <li className="flex items-center justify-start gap-2">
                <span className="text-green-500 text-base">✓</span> الالتزام
                بالجودة
              </li>
              <li className="flex items-center justify-start gap-2">
                <span className="text-green-500 text-base">✓</span> الاحترام
                والكرامة
              </li>
              <li className="flex items-center justify-start gap-2">
                <span className="text-green-500 text-base">✓</span> الابتكار
                المستمر
              </li>
            </ul>
          </div>
        </div>

        {/* === Learn More Button === */}
        <button
          onClick={() => {
            navigate("/about");
            scrollTo(0, 0);
          }}
          className="bg-accent text-primary px-12 py-3 rounded-full mt-10 font-medium hover:bg-secondary hover:text-white transition-all duration-300 cursor-pointer border border-borderLight"
        >
          المزيد
        </button>
      </div>
    </motion.div>
  );
};

export default About;
