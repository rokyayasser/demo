/* eslint-disable no-unused-vars */
import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AdminContext } from "../../context/AdminContext";
import { DoctorContext } from "../../context/DoctorContext";
import {
  UserCircle,
  Lock,
  Mail,
  Stethoscope,
  Heart,
  Eye,
  EyeOff,
} from "lucide-react";

const Login = () => {
  const [role, setRole] = useState("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const navigate = useNavigate();
  const { adminLogin, loading: adminLoading } = useContext(AdminContext);
  const { doctorLogin, loading: doctorLoading } = useContext(DoctorContext);

  const loading = adminLoading || doctorLoading;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (role === "admin") {
      // calls POST /api/v1/admin/login  (defined in AdminContext)
      const ok = await adminLogin(email, password);
      if (ok) navigate("/admin/dashboard");
    } else {
      // calls POST /api/v1/doctor/login  (defined in DoctorContext)
      const ok = await doctorLogin(email, password);
      if (ok) navigate("/doctor/calendar");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-primary to-secondary p-8 text-white text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur"
          >
            <Heart className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold">فارمكولوجي</h1>
          <p className="text-white/80 mt-2">نظام إدارة العيادة</p>
        </div>

        {/* ── Role selector ─────────────────────────────────────────────── */}
        <div className="flex p-2 bg-gray-100 mx-6 mt-6 rounded-xl gap-1">
          <button
            onClick={() => setRole("admin")}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              role === "admin"
                ? "bg-white shadow-lg text-primary"
                : "text-gray-600 hover:text-primary"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <UserCircle className="w-5 h-5" />
              <span>مدير</span>
            </div>
          </button>
          <button
            onClick={() => setRole("doctor")}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              role === "doctor"
                ? "bg-white shadow-lg text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Stethoscope className="w-5 h-5" />
              <span>طبيب</span>
            </div>
          </button>
        </div>

        {/* ── Form ──────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5" dir="rtl">
          {/* Email */}
          <div>
            <label className="block text-textMain font-medium mb-2">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  role === "admin" ? "admin@example.com" : "doctor@example.com"
                }
                className="w-full pr-12 pl-4 py-3 border border-borderLight rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-primary/30"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-textMain font-medium mb-2">
              كلمة المرور
            </label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pr-12 pl-10 py-3 border border-borderLight rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-primary/30"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPass ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg
              hover:shadow-xl transition-all disabled:opacity-70
              ${
                role === "admin"
                  ? "bg-gradient-to-r from-primary to-secondary"
                  : "bg-gradient-to-r from-blue-500 to-teal-500"
              }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>جاري تسجيل الدخول...</span>
              </div>
            ) : (
              "تسجيل الدخول"
            )}
          </motion.button>

          <p className="text-center text-sm text-gray-400">
            {role === "admin"
              ? "للوصول إلى لوحة التحكم الإدارية"
              : "للوصول إلى لوحة الطبيب وإدارة المواعيد"}
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
