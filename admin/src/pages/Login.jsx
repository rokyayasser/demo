/* eslint-disable no-unused-vars */
import React, { useContext, useState } from "react";
import { AdminContext } from "../context/AdminContext";
import { DoctorContext } from "../context/DoctorContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const Login = () => {
  const [state, setState] = useState("Admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { setAToken, backendUrl } = useContext(AdminContext);
  const { setDToken } = useContext(DoctorContext);

  const pageVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (state === "Admin") {
        const { data } = await axios.post(`${backendUrl}/api/admin/login`, {
          email,
          password,
        });
        if (data.success) {
          localStorage.setItem("aToken", data.token);
          setAToken(data.token);
          toast.success("✅ تم تسجيل الدخول بنجاح كمدير");
          navigate("/admin/dashboard");
        } else {
          toast.error(data.message);
        }
      } else {
        // Doctor login
        const { data } = await axios.post(`${backendUrl}/api/doctor/login`, {
          email,
          password,
        });
        if (data.success) {
          localStorage.setItem("dToken", data.token);
          setDToken(data.token);
          toast.success("✅ تم تسجيل الدخول بنجاح كطبيب");
          navigate("/doctor/calendar");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      console.log(error);
      if (state === "Admin") {
        toast.error("فشل في تسجيل الدخول كمدير");
      } else {
        toast.error("فشل في تسجيل الدخول كطبيب");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={onSubmitHandler}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lightBg to-white p-4"
    >
      <motion.div
        variants={itemVariants}
        whileHover={{ boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)" }}
        className="flex flex-col gap-6 p-8 min-w-[340px] sm:min-w-96 bg-white border border-borderLight rounded-2xl text-textMain shadow-lg"
      >
        <motion.div variants={itemVariants} className="text-center">
          <motion.div
            className={`inline-block p-3 rounded-xl mb-4 ${
              state === "Admin"
                ? "bg-gradient-to-r from-primary to-secondary"
                : "bg-gradient-to-r from-blue-500 to-teal-400"
            }`}
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            {state === "Admin" ? (
              <img
                src="https://img.icons8.com/ios-filled/50/ffffff/heart-with-pulse.png"
                alt="Logo"
                className="w-8 h-8"
              />
            ) : (
              <span className="text-2xl text-white">👨‍⚕️</span>
            )}
          </motion.div>
          <motion.p
            className="text-2xl font-bold"
            whileHover={{ scale: 1.05 }}
            style={{
              color: state === "Admin" ? "#3b82f6" : "#0d9488",
            }}
          >
            الخطيب{" "}
            <span
              style={{
                color: state === "Admin" ? "#8b5cf6" : "#0ea5e9",
              }}
            >
              فارما
            </span>
          </motion.p>
          <p className="text-sm text-textSoft mt-2">
            {state === "Admin" ? "نظام إدارة العيادة" : "لوحة الطبيب"}
          </p>
        </motion.div>

        {/* Role Selector */}
        <motion.div variants={itemVariants} className="w-full">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setState("Admin")}
              className={`flex-1 py-2 rounded transition-all ${
                state === "Admin"
                  ? "bg-white shadow text-primary font-medium"
                  : "text-gray-600"
              }`}
            >
              مدير
            </button>
            <button
              type="button"
              onClick={() => setState("Doctor")}
              className={`flex-1 py-2 rounded transition-all ${
                state === "Doctor"
                  ? "bg-white shadow text-blue-600 font-medium"
                  : "text-gray-600"
              }`}
            >
              طبيب
            </button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="w-full">
          <p className="font-medium mb-2">البريد الإلكتروني</p>
          <motion.input
            whileFocus={{
              scale: 1.02,
              borderColor: state === "Admin" ? "#3b82f6" : "#0ea5e9",
            }}
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className="border border-borderLight bg-lightBg rounded-xl w-full p-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
            type="email"
            placeholder={
              state === "Admin" ? "admin@clinic.com" : "doctor@clinic.com"
            }
            required
          />
        </motion.div>

        <motion.div variants={itemVariants} className="w-full">
          <p className="font-medium mb-2">كلمة المرور</p>
          <motion.input
            whileFocus={{
              scale: 1.02,
              borderColor: state === "Admin" ? "#3b82f6" : "#0ea5e9",
            }}
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            className="border border-borderLight bg-lightBg rounded-xl w-full p-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
            type="password"
            placeholder="••••••••"
            required
          />
        </motion.div>

        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={loading}
          className={`text-white w-full py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300 disabled:opacity-50 ${
            state === "Admin"
              ? "bg-gradient-to-r from-primary to-secondary"
              : "bg-gradient-to-r from-blue-500 to-teal-400"
          }`}
        >
          {loading
            ? "جاري تسجيل الدخول..."
            : state === "Admin"
            ? "تسجيل الدخول كمدير"
            : "تسجيل الدخول كطبيب"}
        </motion.button>

        <motion.div
          variants={itemVariants}
          className="text-center text-sm text-textSoft"
        >
          {state === "Admin" ? (
            <p>
              لديك حساب طبيب؟{" "}
              <button
                type="button"
                onClick={() => setState("Doctor")}
                className="text-blue-600 underline cursor-pointer hover:text-blue-700"
              >
                اضغط هنا
              </button>
            </p>
          ) : (
            <p>
              لديك حساب مدير؟{" "}
              <button
                type="button"
                onClick={() => setState("Admin")}
                className="text-primary underline cursor-pointer hover:text-primary-dark"
              >
                اضغط هنا
              </button>
            </p>
          )}
        </motion.div>
      </motion.div>
    </motion.form>
  );
};

export default Login;
