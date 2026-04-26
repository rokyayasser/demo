/* eslint-disable no-unused-vars */

import React from "react";
import { motion } from "framer-motion";

const AnimatedText = ({ children, delay = 0, className = "" }) => {
  const variants = {
    hidden: {
      opacity: 0,
      y: 30,
      filter: "blur(10px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)", // يصبح واضحاً تماماً
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: delay,
      },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }} // يبدأ الأنيميشن عندما يظهر 30% من العنصر على الشاشة، ولمرة واحدة فقط
      variants={variants}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedText;
