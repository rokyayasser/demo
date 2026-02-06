/* eslint-disable no-unused-vars */
import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { NavLink, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { Globe } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { token, setToken, userData, loadUserProfileData } =
    useContext(AppContext);

  useEffect(() => {
    if (token && !userData) {
      loadUserProfileData();
    }
  }, [token, userData]);

  return (
    <div
      dir="rtl"
      className="flex items-center justify-between text-sm py-4 mb-5 border-b border-borderLight px-5 md:px-10 bg-white"
    >
      {/* === Logo === */}
      <div
        onClick={() => navigate("/")}
        className="flex items-center gap-2 cursor-pointer"
      >
        <div className="bg-gradient-to-tr from-secondary to-primary p-2 rounded-lg">
          <img
            src="https://img.icons8.com/ios-filled/50/ffffff/heart-with-pulse.png"
            alt="Logo"
            className="w-5 h-5"
          />
        </div>
        <div className="text-right leading-tight">
          <h1 className="text-base font-semibold text-textMain">
            الخطيب <span className="text-primary font-bold">فارما</span>
          </h1>
          <p className="text-xs text-secondary">مركز طبي متخصص</p>
        </div>
      </div>

      {/* === Desktop Navigation === */}
      <ul className="hidden md:flex items-start gap-6 font-medium text-textMain">
        <NavLink to="/" className="group">
          <li className="py-1 cursor-pointer hover:text-primary transition a">
            الرئيسية
          </li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden " />
        </NavLink>
        <NavLink to="/medical-services" className="group">
          <li className="py-1 cursor-pointer hover:text-primary transition">
            الخدمات الطبية
          </li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden " />
        </NavLink>
        <NavLink to="/courses" className="group">
          <li className="py-1 cursor-pointer hover:text-primary transition">
            الدورات
          </li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden group-hover:block" />
        </NavLink>
        <NavLink to="/about" className="group">
          <li className="py-1 cursor-pointer hover:text-primary transition">
            من نحن
          </li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden " />
        </NavLink>
        <NavLink to="/contact" className="group">
          <li className="py-1 cursor-pointer hover:text-primary transition">
            اتصل بنا
          </li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden " />
        </NavLink>
      </ul>

      {/* === Right Section (Profile + Language + Menu) === */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-1 text-textSoft cursor-pointer hover:text-primary transition">
          <Globe size={16} />
          <span>العربية</span>
        </div>

        {token ? (
          <div className="relative">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <img
                className="w-8 h-8 rounded-full border border-borderLight object-cover"
                src={userData?.image || assets.profile_pic}
                alt="Profile"
              />
              <img
                className={`w-2.5 transition-transform duration-200 ${
                  showDropdown ? "rotate-180" : ""
                }`}
                src={assets.dropdown_icon}
                alt="Dropdown Icon"
              />
            </div>

            {showDropdown && (
              <div className="absolute top-12 right-0 min-w-48 bg-white shadow-lg border border-borderLight rounded-lg flex flex-col gap-3 p-4 z-20">
                <button
                  className="text-right hover:text-primary cursor-pointer transition py-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdown(false);
                    navigate("/my-profile");
                  }}
                >
                  الملف الشخصي
                </button>
                <button
                  className="text-right hover:text-primary cursor-pointer transition py-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdown(false);
                    navigate("/my-appointments");
                  }}
                >
                  المواعيد
                </button>
                <button
                  className="text-right hover:text-primary cursor-pointer transition py-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdown(false);
                    navigate("/my-courses");
                  }}
                >
                  دوراتي
                </button>
                <hr className="my-1 border-borderLight" />
                <button
                  className="text-right text-red-500 hover:text-red-600 cursor-pointer transition py-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdown(false);
                    setToken("");
                    localStorage.removeItem("token");
                    navigate("/login");
                  }}
                >
                  تسجيل الخروج
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="bg-primary text-white px-8 py-3 rounded-full font-light hidden md:block cursor-pointer hover:bg-secondary transition"
          >
            إنشاء حساب
          </button>
        )}

        {/* === Mobile Menu Icon === */}
        <img
          src={assets.menu_icon}
          alt="Menu Icon"
          className="w-6 md:hidden cursor-pointer"
          onClick={() => setShowMenu(!showMenu)}
        />
      </div>

      {/* === Mobile Menu === */}
      {showMenu && (
        <div className="fixed top-0 right-0 bottom-0 w-full md:hidden bg-white z-20 overflow-auto transition-all">
          <div className="flex items-center justify-between px-5 py-6 border-b border-borderLight">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-tr from-secondary to-primary p-2 rounded-lg">
                <img
                  src="https://img.icons8.com/ios-filled/50/ffffff/heart-with-pulse.png"
                  alt="Logo"
                  className="w-5 h-5"
                />
              </div>
              <h1 className="text-base font-semibold text-textMain">
                الخطيب <span className="text-primary font-bold">فارما</span>
              </h1>
            </div>
            <img
              className="w-7 cursor-pointer"
              onClick={() => setShowMenu(false)}
              src={assets.cross_icon}
              alt="Close"
            />
          </div>

          <ul className="flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium text-textMain">
            <NavLink onClick={() => setShowMenu(false)} to="/">
              <p className="px-4 py-2 rounded-full inline-block hover:bg-accent transition">
                الرئيسية
              </p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/medical-services">
              <p className="px-4 py-2 rounded-full inline-block hover:bg-accent transition">
                الخدمات الطبية
              </p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/about">
              <p className="px-4 py-2 rounded-full inline-block hover:bg-accent transition">
                من نحن
              </p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/contact">
              <p className="px-4 py-2 rounded-full inline-block hover:bg-accent transition">
                اتصل بنا
              </p>
            </NavLink>
            {token && (
              <>
                <NavLink onClick={() => setShowMenu(false)} to="/my-profile">
                  <p className="px-4 py-2 rounded-full inline-block hover:bg-accent transition">
                    الملف الشخصي
                  </p>
                </NavLink>
                <NavLink
                  onClick={() => setShowMenu(false)}
                  to="/my-appointments"
                >
                  <p className="px-4 py-2 rounded-full inline-block hover:bg-accent transition">
                    المواعيد
                  </p>
                </NavLink>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;
