/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";

const Input = ({
  label,
  type = "text",
  placeholder = "",
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  startIcon,
  endIcon,
  className = "",
  containerClassName = "",
  ...props
}) => {
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label className="block text-textMain font-medium mb-2">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}

      <div className="relative">
        {startIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-textSoft">
            {startIcon}
          </div>
        )}

        <motion.input
          whileFocus={{ scale: 1.02 }}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full border ${error ? "border-red-500" : "border-borderLight"} 
            rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30
            bg-lightBg text-textMain
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            ${startIcon ? "pr-12" : ""}
            ${endIcon ? "pl-12" : ""}
            ${className}
          `}
          {...props}
        />

        {endIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-textSoft">
            {endIcon}
          </div>
        )}
      </div>

      {(error || helperText) && (
        <p
          className={`mt-2 text-sm ${error ? "text-red-500" : "text-textSoft"}`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
