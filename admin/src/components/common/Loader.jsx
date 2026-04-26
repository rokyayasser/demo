/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";

const Loader = ({ size = "md", text = "" }) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <motion.div
        className={`${sizeClasses[size]} spinner`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      {text && <p className="text-textSoft text-sm">{text}</p>}
    </div>
  );
};

export default Loader;
