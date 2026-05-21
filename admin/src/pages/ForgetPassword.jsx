// pages/ForgotPassword.jsx (admin panel)
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.config";
import { toast } from "react-toastify";

const STEPS = { EMAIL: 1, OTP: 2, NEW_PASSWORD: 3, DONE: 4 };

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  // Step 1 — send OTP
  const handleSendOtp = async () => {
    if (!email.trim()) {
      toast.error("أدخل بريدك الإلكتروني");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/api/v1/admin/forgot-password", {
        email,
      });
      if (data.success) {
        // Dev mode — OTP returned in response
        if (data.data?.otp) {
          toast.info(`كود التطوير: ${data.data.otp}`, { autoClose: false });
        }
        // Save masked email to show in OTP step
        if (data.data?.maskedEmail) setMaskedEmail(data.data.maskedEmail);
        setStep(STEPS.OTP);
      } else toast.error(data.message);
    } catch (e) {
      toast.error(e.response?.data?.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — verify OTP against backend before proceeding
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("أدخل الكود المكون من 6 أرقام");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/api/v1/admin/verify-otp", {
        email,
        otp,
      });
      if (data.success) {
        setStep(STEPS.NEW_PASSWORD);
      } else {
        toast.error(data.message || "الكود غير صحيح");
        setOtp("");
      }
    } catch (e) {
      toast.error(
        e.response?.data?.message || "الكود غير صحيح أو منتهي الصلاحية",
      );
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  // Step 3 — reset password
  const handleReset = async () => {
    if (!newPwd || !confirm) {
      toast.error("أدخل كلمة المرور الجديدة");
      return;
    }
    if (newPwd !== confirm) {
      toast.error("كلمة المرور غير متطابقة");
      return;
    }
    if (newPwd.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/api/v1/admin/reset-password", {
        email,
        otp,
        newPassword: newPwd,
      });
      if (data.success) {
        setStep(STEPS.DONE);
      } else toast.error(data.message);
    } catch (e) {
      toast.error(
        e.response?.data?.message || "الكود غير صحيح أو منتهي الصلاحية",
      );
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = ["البريد الإلكتروني", "التحقق", "كلمة المرور الجديدة"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary p-8 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold mb-1">نسيت كلمة المرور؟</h1>
          <p className="text-white/70 text-sm">سنرسل لك كود لإعادة التعيين</p>
        </div>

        {/* Step indicator */}
        {step < STEPS.DONE && (
          <div className="flex items-center justify-center gap-2 px-8 pt-6">
            {stepLabels.map((label, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                    ${
                      step > i + 1
                        ? "bg-green-500 text-white"
                        : step === i + 1
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {step > i + 1 ? <CheckCircle className="w-4 h-4" /> : i + 1}
                  </div>
                  <span
                    className={`text-xs ${step === i + 1 ? "text-primary font-medium" : "text-gray-400"}`}
                  >
                    {label}
                  </span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mb-5 rounded-full transition-colors
                    ${step > i + 1 ? "bg-green-500" : "bg-gray-200"}`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        <div className="p-8" dir="rtl">
          <AnimatePresence mode="wait">
            {/* Step 1 — Email */}
            {step === STEPS.EMAIL && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <p className="text-gray-500 text-sm">
                  أدخل بريدك الإلكتروني المسجل وسنرسل لك كود التحقق.
                </p>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                    placeholder="admin@example.com"
                    className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl text-sm
                      focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white
                    rounded-xl font-bold text-sm hover:shadow-lg transition disabled:opacity-60"
                >
                  {loading ? "جارٍ الإرسال..." : "إرسال كود التحقق"}
                </button>
              </motion.div>
            )}

            {/* Step 2 — OTP */}
            {step === STEPS.OTP && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <p className="text-gray-500 text-sm">
                  تم إرسال كود التحقق إلى{" "}
                  <span className="font-bold text-gray-700">
                    {maskedEmail || email}
                  </span>
                  <br />
                  <span className="text-xs text-gray-400">
                    تحقق من صندوق الوارد أو البريد العشوائي
                  </span>
                </p>
                <div className="relative">
                  <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                    placeholder="أدخل الكود المكون من 6 أرقام"
                    className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl text-sm
                      focus:outline-none focus:ring-2 focus:ring-primary/40 text-center tracking-widest text-lg"
                  />
                </div>
                <button
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white
                    rounded-xl font-bold text-sm hover:shadow-lg transition disabled:opacity-60"
                >
                  {loading ? "جارٍ التحقق..." : "التحقق من الكود"}
                </button>
                <button
                  onClick={() => {
                    setStep(STEPS.EMAIL);
                    setOtp("");
                  }}
                  className="w-full py-2 text-gray-400 text-sm hover:text-gray-600 transition"
                >
                  إعادة إرسال الكود
                </button>
              </motion.div>
            )}

            {/* Step 3 — New password */}
            {step === STEPS.NEW_PASSWORD && (
              <motion.div
                key="newpwd"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <p className="text-gray-500 text-sm">
                  أدخل كلمة مرور جديدة قوية.
                </p>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPwd ? "text" : "password"}
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    placeholder="كلمة المرور الجديدة"
                    className="w-full pr-10 pl-10 py-3 border border-gray-200 rounded-xl text-sm
                      focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPwd ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPwd ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleReset()}
                    placeholder="تأكيد كلمة المرور"
                    className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl text-sm
                      focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                {confirm && newPwd !== confirm && (
                  <p className="text-red-500 text-xs">
                    كلمة المرور غير متطابقة
                  </p>
                )}
                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white
                    rounded-xl font-bold text-sm hover:shadow-lg transition disabled:opacity-60"
                >
                  {loading ? "جارٍ التغيير..." : "تغيير كلمة المرور"}
                </button>
              </motion.div>
            )}

            {/* Step 4 — Done */}
            {step === STEPS.DONE && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4 space-y-4"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  تم تغيير كلمة المرور!
                </h3>
                <p className="text-gray-500 text-sm">
                  يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white
                    rounded-xl font-bold text-sm hover:shadow-lg transition"
                >
                  <div className="flex items-center justify-center gap-2">
                    <ArrowRight className="w-4 h-4" /> الذهاب لتسجيل الدخول
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
