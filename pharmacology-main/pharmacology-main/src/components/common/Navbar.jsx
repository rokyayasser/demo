import React, { useState, useEffect, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import { ChevronDown, ShoppingCart } from "lucide-react";
import { AppContext } from "../../context/AppContext";
import { ProductContext } from "../../context/ProductContext";
import MenuToggle from "./MenuToggle";
import Button from "./Button";

const Navbar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const { token, userData, logout } = useContext(AppContext);
  const { cartCount } = useContext(ProductContext);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setShowMenu(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navLinkStyle = ({ isActive }) =>
    isActive
      ? "text-white px-5 py-1.5 rounded-xl transition-colors font-medium text-sm md:text-base bg-gradient-to-r from-[#2a0048] via-[#130348] to-[#021186]"
      : "text-gray-800 hover:text-[#2a0048] px-3 py-1.5 transition-colors font-medium text-sm md:text-base";

  return (
    <div
      className={`absolute left-0 right-0 z-[100] w-full flex justify-center transition-all duration-300 ${
        showMenu ? "top-0" : "top-0 md:top-6 md:px-10"
      }`}
      dir="rtl"
    >
      <div className="w-full max-w-7xl flex items-center justify-between bg-white px-6 py-4 md:py-3 transition-all duration-300 relative shadow-md rounded-2xl m-4 flex-row-reverse md:flex-row">
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2 cursor-pointer z-[70]"
        >
          <img src={assets.logo2} alt="Logo" className="w-32 md:w-42" />
        </div>

        {/* Desktop Navigation */}
        <ul className="hidden lg:flex items-center gap-1 xl:gap-4">
          <NavLink to="/" className={navLinkStyle}>
            الصفحة الرئيسة
          </NavLink>
          <NavLink to="/about" className={navLinkStyle}>
            من أنا
          </NavLink>
          <NavLink to="/blogs" className={navLinkStyle}>
            المقالات
          </NavLink>
          <NavLink to="/consultations" className={navLinkStyle}>
            استشارة
          </NavLink>
          <NavLink to="/courses" className={navLinkStyle}>
            الكورسات
          </NavLink>
          <NavLink to="/products" className={navLinkStyle}>
            المنتجات
          </NavLink>
        </ul>

        {/* Right section */}
        <div className="flex items-center gap-3 md:gap-4 z-[110]">
          {/* Cart Icon — visible on desktop when logged in */}

          <button
            onClick={() => navigate("/cart")}
            className="relative hidden lg:flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label="عربة التسوق"
          >
            <ShoppingCart size={20} className="text-gray-700" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -left-1 min-w-[18px] h-[18px] bg-[#9b61db] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-bounce-once">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </button>

          {token ? (
            <div className="relative hidden lg:block">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <img
                  className="w-10 h-10 rounded-full border-2 object-cover"
                  src={userData?.image || assets.profile_pic}
                  alt="Profile"
                />
              </div>

              {showDropdown && (
                <div className="absolute top-14 left-0 min-w-52 bg-white shadow-xl border border-gray-100 rounded-xl flex flex-col gap-1 p-3 z-20">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate("/my-profile");
                    }}
                    className="text-right hover:text-[#3a5b8c] cursor-pointer transition py-2 px-2 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    الملف الشخصي
                  </button>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate("/my-appointments");
                    }}
                    className="text-right hover:text-[#3a5b8c] cursor-pointer transition py-2 px-2 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    مواعيدي
                  </button>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate("/my-courses");
                    }}
                    className="text-right hover:text-[#3a5b8c] cursor-pointer transition py-2 px-2 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    كورساتي
                  </button>

                  {/* Cart in dropdown with count */}
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate("/cart");
                    }}
                    className="text-right hover:text-[#3a5b8c] cursor-pointer transition py-2 px-2 rounded-lg hover:bg-gray-50 text-sm flex items-center justify-between"
                  >
                    <span>عربة التسوق</span>
                    {cartCount > 0 && (
                      <span className="bg-[#9b61db] text-white text-[10px] font-bold rounded-full px-2 py-0.5">
                        {cartCount}
                      </span>
                    )}
                  </button>

                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      logout();
                    }}
                    className="text-right text-red-500 hover:text-red-600 cursor-pointer transition py-2 px-2 rounded-lg hover:bg-red-50 text-sm"
                  >
                    تسجيل الخروج
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button
              className="px-6 py-1.5 md:px-8 md:py-2 hidden lg:block"
              to="/login"
            >
              تسجيل
            </Button>
          )}

          <div className="lg:hidden flex items-center gap-2">
            {/* Mobile cart icon */}
            {token && (
              <button
                onClick={() => navigate("/cart")}
                className="relative flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200"
              >
                <ShoppingCart size={18} className="text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -left-1 min-w-[16px] h-[16px] bg-[#9b61db] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>
            )}
            <MenuToggle
              isOpen={showMenu}
              toggle={() => setShowMenu(!showMenu)}
            />
          </div>
        </div>
      </div>

      {/* Overlay */}
      {showMenu && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] lg:hidden z-[80]"
          onClick={() => setShowMenu(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[75%] max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden z-[90] flex flex-col pt-20 ${
          showMenu ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="px-6 py-6 flex-grow space-y-2 overflow-y-auto mt-4">
          <ul
            className="flex flex-col gap-2 text-lg font-medium text-gray-800"
            dir="rtl"
          >
            <NavLink
              onClick={() => setShowMenu(false)}
              to="/"
              className="block py-3 px-4 rounded-xl hover:bg-blue-50 hover:text-[#3a5b8c] transition"
            >
              الصفحة الرئيسة
            </NavLink>
            <NavLink
              onClick={() => setShowMenu(false)}
              to="/about"
              className="block py-3 px-4 rounded-xl hover:bg-blue-50 hover:text-[#3a5b8c] transition"
            >
              من أنا
            </NavLink>
            <NavLink
              onClick={() => setShowMenu(false)}
              to="/blogs"
              className="block py-3 px-4 rounded-xl hover:bg-blue-50 hover:text-[#3a5b8c] transition"
            >
              المقالات
            </NavLink>
            <NavLink
              onClick={() => setShowMenu(false)}
              to="/consultations"
              className="block py-3 px-4 rounded-xl hover:bg-blue-50 hover:text-[#3a5b8c] transition"
            >
              استشارة
            </NavLink>
            <NavLink
              onClick={() => setShowMenu(false)}
              to="/courses"
              className="block py-3 px-4 rounded-xl hover:bg-blue-50 hover:text-[#3a5b8c] transition"
            >
              الكورسات
            </NavLink>
            <NavLink
              onClick={() => setShowMenu(false)}
              to="/products"
              className="block py-3 px-4 rounded-xl hover:bg-blue-50 hover:text-[#3a5b8c] transition"
            >
              المنتجات
            </NavLink>

            {/* Mobile cart link */}
            {token && (
              <button
                onClick={() => {
                  setShowMenu(false);
                  navigate("/cart");
                }}
                className="flex items-center justify-between w-full text-right py-3 px-4 rounded-xl hover:bg-purple-50 hover:text-[#9b61db] transition"
              >
                <span className="flex items-center gap-2">
                  <ShoppingCart size={18} />
                  عربة التسوق
                </span>
                {cartCount > 0 && (
                  <span className="bg-[#9b61db] text-white text-xs font-bold rounded-full px-2 py-0.5">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
          </ul>
        </div>

        <div
          className="px-6 pb-8 pt-4 bg-white border-t border-gray-100"
          dir="rtl"
        >
          {token ? (
            <div className="flex flex-col gap-2">
              <NavLink
                onClick={() => setShowMenu(false)}
                to="/my-profile"
                className="block text-center py-3 px-4 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-800 font-medium transition"
              >
                الملف الشخصي
              </NavLink>
              <button
                onClick={() => {
                  setShowMenu(false);
                  logout();
                }}
                className="mt-2 bg-red-50 text-red-500 border border-red-100 px-8 py-3 rounded-xl font-medium w-full hover:bg-red-500 hover:text-white transition"
              >
                تسجيل الخروج
              </button>
            </div>
          ) : (
            <Button className="px-6 py-1.5 md:px-8 md:py-2 w-full" to="/login">
              دخول
            </Button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes bounce-once {
          0%,100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }
        .animate-bounce-once { animation: bounce-once 0.4s ease; }
      `}</style>
    </div>
  );
};

export default Navbar;
