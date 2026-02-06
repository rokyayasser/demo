/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle, X } from "lucide-react";

const WhatsAppCompact = () => {
  const [isVisible, setIsVisible] = useState(false);
  const whatsappNumber = "+966501234567";

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    const message = "مرحباً، أود الاستفسار عن الخدمات الطبية";
    const url = `https://wa.me/${whatsappNumber.replace(
      /\D/g,
      ""
    )}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 25,
        delay: 1,
      }}
      whileHover={{ x: -5 }}
      className="fixed bottom-6 left-6 z-40"
    >
      <button
        onClick={handleClick}
        className="group relative bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300"
      >
        <MessageCircle className="w-7 h-7" />

        {/* Tooltip on hover */}
        <div className="absolute left-full top-1/2 -translate-y-1/2 mr-3 hidden group-hover:block">
          <div className="bg-white text-textMain px-4 py-2 rounded-lg shadow-lg whitespace-nowrap">
            <span className="font-bold">تواصل عبر واتساب</span>
            <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-white"></div>
          </div>
        </div>

        {/* Notification pulse */}
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 0, 0.7],
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
          }}
          className="absolute inset-0 rounded-full bg-green-500"
        />
      </button>
    </motion.div>
  );
};

export default WhatsAppCompact;
