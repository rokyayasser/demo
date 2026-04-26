// components/common/MenuToggle.jsx
import React from "react";

/**
 * Hamburger / X toggle button for mobile nav.
 * Props:
 *   isOpen  {boolean}  — true = show X, false = show hamburger
 *   toggle  {function} — called on click
 *
 * NOTE: Do NOT pass a `jsx` prop to any DOM element — React warns if a
 * non-boolean HTML attribute receives a boolean value.
 */
const MenuToggle = ({ isOpen, toggle }) => (
  <button
    onClick={toggle}
    aria-label={isOpen ? "إغلاق القائمة" : "فتح القائمة"}
    className="flex flex-col items-center justify-center w-9 h-9 gap-[5px] focus:outline-none"
  >
    <span
      className={`block h-[2px] bg-current rounded-full transition-all duration-300 origin-center
        ${isOpen ? "w-6 rotate-45 translate-y-[7px]" : "w-6"}`}
    />
    <span
      className={`block h-[2px] bg-current rounded-full transition-all duration-300
        ${isOpen ? "w-0 opacity-0" : "w-5"}`}
    />
    <span
      className={`block h-[2px] bg-current rounded-full transition-all duration-300 origin-center
        ${isOpen ? "w-6 -rotate-45 -translate-y-[7px]" : "w-6"}`}
    />
  </button>
);

export default MenuToggle;
