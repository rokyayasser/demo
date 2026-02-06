/* eslint-disable no-unused-vars */
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnOverlayClick = true,
}) => {
  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-screen-xl",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOnOverlayClick ? onClose : null}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`bg-white rounded-2xl w-full ${sizes[size]} shadow-2xl`}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-borderLight">
                <h3 className="text-xl font-bold text-textMain">{title}</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="text-textSoft hover:text-red-500 transition-colors"
                >
                  <X size={24} />
                </motion.button>
              </div>

              {/* Content */}
              <div className="p-6">{children}</div>

              {/* Footer */}
              {footer && (
                <div className="p-6 border-t border-borderLight bg-lightBg/30">
                  {footer}
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
