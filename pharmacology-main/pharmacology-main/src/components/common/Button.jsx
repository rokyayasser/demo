/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  loading = false,
  startIcon,
  endIcon,
  to,
  onClick,
  className = "",
  type = "button",
  ...props
}) => {
  const baseClasses =
    "font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-[#021186]/60 hover:scale-[1.01] cursor-pointer ";

  const variants = {
    primary:
      "bg-gradient-to-r from-[#2a0048] via-[#130348] to-[#021186] text-[#f1f5ff] shadow-lg shadow-[#021186]/30 hover:shadow-[#021186]/60 hover:scale-[1.01] border border-white/10 ",

    secondary:
      "bg-white/10 backdrop-blur-xl text-[#f1f5ff] border border-white/20 hover:bg-white/20",

    outline:
      "bg-transparent border border-[#b8c1ff]/40 text-[#b8c1ff] hover:bg-[#021186]/30 hover:text-white",

    danger: "bg-red-600/80 backdrop-blur-md text-white hover:bg-red-700",

    success:
      "bg-emerald-600/80 backdrop-blur-md text-white hover:bg-emerald-700",

    ghost: "bg-transparent text-[#b8c1ff] hover:bg-white/10",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    xl: "px-10 py-5 text-xl",
  };

  const widthClass = fullWidth ? "w-full" : "";
  const disabledClass = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <Link to={to} className="">
      <motion.button
        whileHover={!disabled && !loading ? { scale: 1.05 } : {}}
        whileTap={!disabled && !loading ? { scale: 0.95 } : {}}
        onClick={onClick}
        type={type}
        className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${disabledClass} ${className}   
    py-3.5 rounded-xl 
    flex justify-center items-center gap-2 
    font-medium text-md
    border border-white/10
    shadow-lg shadow-[#021186]/30
    transition-all duration-300
    hover:shadow-[#021186]/60
    hover:scale-[1.01]
    text-white

    `}
        {...props}
      >
        {loading && (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent"></div>
        )}
        {!loading && startIcon && <span>{startIcon}</span>}
        <span>{children}</span>
        {!loading && endIcon && <span>{endIcon}</span>}
      </motion.button>
    </Link>
  );
};

export default Button;
