/* eslint-disable no-unused-vars */
import React, { useContext, useState, useEffect } from "react";

import { authApi } from "../../api/auth.api";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { AppContext } from "../../context/AppContext";

const Login = () => {
  const { setToken } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [state, setState] = useState({
    formType: "Sign Up",
    email: "",
    password: "",
    name: "",
    loading: false,
  });

  const pageVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.3,
      },
    },
  };

  const formVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const nameFieldVariants = {
    hidden: { opacity: 0, height: 0, marginBottom: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      marginBottom: "1rem",
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      marginBottom: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setState((prev) => ({ ...prev, loading: true }));

    try {
      let response;

      if (state.formType === "Sign Up") {
        response = await authApi.register({
          name: state.name,
          email: state.email,
          password: state.password,
        });

        if (response.success) {
          localStorage.setItem("token", response.token);
          localStorage.setItem("user", JSON.stringify(response.user));
          setToken(response.token);
          toast.success("🎉 تم إنشاء الحساب بنجاح");

          // Redirect after successful signup
          navigate(from, { replace: true });
        } else {
          toast.error(response.message);
        }
      } else {
        response = await authApi.login({
          email: state.email,
          password: state.password,
        });

        if (response.success) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.user));
          setToken(response.data.token);
          toast.success("✅ تم تسجيل الدخول بنجاح");

          // ✅ CRITICAL FIX: Redirect to the original page
          navigate(from, { replace: true });
        } else {
          toast.error(response.message);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="min-h-[80vh] flex items-center justify-center px-4"
      dir="rtl"
    >
      <motion.form
        key={state.formType}
        onSubmit={handleSubmit}
        variants={formVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-5 p-8 w-full max-w-md border border-borderLight rounded-2xl text-textSoft text-sm shadow-2xl bg-white"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-2">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary text-white text-2xl">
            {state.formType === "Sign Up" ? "👤" : "🔐"}
          </div>
          <p className="text-2xl font-bold text-primary">
            {state.formType === "Sign Up" ? "إنشاء حساب جديد" : "تسجيل الدخول"}
          </p>
          <p className="mt-2">
            {state.formType === "Sign Up"
              ? "انضم إلينا وابدأ رحلة العناية بصحتك"
              : "مرحباً بعودتك! سجل دخولك الآن"}
          </p>
        </motion.div>

        {/* Name Field (Sign Up only) */}
        <AnimatePresence mode="wait">
          {state.formType === "Sign Up" && (
            <motion.div
              key="name-field"
              variants={nameFieldVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full overflow-hidden"
            >
              <label className="block text-textMain font-medium mb-2">
                الاسم الكامل
              </label>
              <input
                className="border border-borderLight bg-lightBg rounded-xl w-full p-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
                type="text"
                value={state.name}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, name: e.target.value }))
                }
                required
                placeholder="أدخل اسمك الكامل"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email Field */}
        <motion.div variants={itemVariants} className="w-full">
          <label className="block text-textMain font-medium mb-2">
            البريد الإلكتروني
          </label>
          <input
            className="border border-borderLight bg-lightBg rounded-xl w-full p-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
            type="email"
            value={state.email}
            onChange={(e) =>
              setState((prev) => ({ ...prev, email: e.target.value }))
            }
            required
            placeholder="example@email.com"
          />
        </motion.div>

        {/* Password Field */}
        <motion.div variants={itemVariants} className="w-full">
          <label className="block text-textMain font-medium mb-2">
            كلمة المرور
          </label>
          <input
            className="border border-borderLight bg-lightBg rounded-xl w-full p-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
            type="password"
            value={state.password}
            onChange={(e) =>
              setState((prev) => ({ ...prev, password: e.target.value }))
            }
            required
            placeholder="********"
          />
        </motion.div>

        {/* Submit Button */}
        <motion.button
          variants={itemVariants}
          type="submit"
          disabled={state.loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-primary to-secondary text-white w-full py-3.5 rounded-xl text-base font-bold hover:from-secondary hover:to-primary transition-all duration-300 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed mt-2"
        >
          {state.loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              {state.formType === "Sign Up"
                ? "جاري إنشاء الحساب..."
                : "جاري تسجيل الدخول..."}
            </div>
          ) : state.formType === "Sign Up" ? (
            "إنشاء حساب"
          ) : (
            "تسجيل الدخول"
          )}
        </motion.button>

        {/* Toggle between Sign Up/Login */}
        <motion.div variants={itemVariants} className="text-center mt-4">
          {state.formType === "Sign Up" ? (
            <p>
              لديك حساب بالفعل؟{" "}
              <span
                onClick={() =>
                  setState((prev) => ({ ...prev, formType: "Login" }))
                }
                className="text-primary font-bold cursor-pointer hover:underline"
              >
                تسجيل الدخول هنا
              </span>
            </p>
          ) : (
            <p>
              ليس لديك حساب؟{" "}
              <span
                onClick={() =>
                  setState((prev) => ({ ...prev, formType: "Sign Up" }))
                }
                className="text-primary font-bold cursor-pointer hover:underline"
              >
                انشاء حساب جديد
              </span>
            </p>
          )}
        </motion.div>

        {/* Features */}
        <motion.div
          variants={itemVariants}
          className="mt-6 pt-6 border-t border-borderLight"
        >
          <p className="text-textMain font-bold mb-3">مزايا التسجيل:</p>
          <ul className="text-textSoft text-sm space-y-2">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              حجز المواعيد بسهولة
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              متابعة جميع المواعيد
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              استلام التنبيهات والتحديثات
            </li>
          </ul>
        </motion.div>
      </motion.form>
    </motion.div>
  );
};

export default Login;
