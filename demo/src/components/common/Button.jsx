/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  loading = false,
  startIcon,
  endIcon,
  onClick,
  className = "",
  type = "button",
  ...props
}) => {
  const baseClasses =
    "font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2";

  const variants = {
    primary:
      "bg-gradient-to-r from-primary to-secondary text-white hover:from-secondary hover:to-primary hover:shadow-xl",
    secondary: "bg-accent text-primary hover:bg-secondary hover:text-white",
    outline:
      "bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white",
    danger: "bg-red-600 text-white hover:bg-red-700",
    success: "bg-green-600 text-white hover:bg-green-700",
    ghost: "bg-transparent text-textMain hover:bg-lightBg",
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
    <motion.button
      whileHover={!disabled && !loading ? { scale: 1.05 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${disabledClass} ${className}`}
      {...props}
    >
      {loading && (
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent"></div>
      )}
      {!loading && startIcon && <span>{startIcon}</span>}
      <span>{children}</span>
      {!loading && endIcon && <span>{endIcon}</span>}
    </motion.button>
  );
};

export default Button;
