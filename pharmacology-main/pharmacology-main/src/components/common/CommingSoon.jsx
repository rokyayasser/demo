// src/components/common/ComingSoon.jsx
import React from "react";
import { motion } from "framer-motion";
import { Clock, Bell } from "lucide-react";

const ComingSoon = ({
  title = "قريباً",
  subtitle = "نعمل على شيء رائع لك",
}) => {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      dir="rtl"
    >
      <div className="text-center max-w-lg mx-auto">
        {/* Animated icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="w-28 h-28 mx-auto mb-8 rounded-full
            bg-gradient-to-br from-[#2d1b5a] to-[#9b61db]
            flex items-center justify-center shadow-2xl shadow-[#9b61db]/30"
        >
          <Clock className="w-14 h-14 text-white" />
        </motion.div>

        {/* Text */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl font-extrabold text-white mb-4"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-gray-400 text-lg leading-relaxed mb-8"
        >
          {subtitle}
        </motion.p>

        {/* Decorative dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
              className="w-3 h-3 rounded-full bg-[#9b61db]"
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default ComingSoon;
