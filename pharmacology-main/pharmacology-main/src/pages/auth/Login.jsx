/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, User, Heart, ArrowRight, Eye, EyeOff } from "lucide-react";

// ─── Validation helpers ───────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[0-9\s\-()]{8,20}$/;

const validateStep1 = (state) => {
  if (!state.name || state.name.trim().length < 2)
    return "الاسم يجب أن يكون حرفين على الأقل";
  if (!state.email || !EMAIL_RE.test(state.email))
    return "يرجى إدخال بريد إلكتروني صالح";
  if (!state.password || state.password.length < 8)
    return "كلمة المرور يجب أن تكون 8 أحرف على الأقل";
  if (state.password !== state.confirmPassword)
    return "كلمتا المرور غير متطابقتين";
  return null;
};

const validateStep2 = (state) => {
  if (!state.gender) return "يرجى اختيار الجنس";
  if (!state.birthdate) return "يرجى إدخال تاريخ الميلاد";
  if (
    !state.height ||
    isNaN(state.height) ||
    +state.height < 50 ||
    +state.height > 250
  )
    return "يرجى إدخال طول صحيح (50-250 سم)";
  if (
    !state.weight ||
    isNaN(state.weight) ||
    +state.weight < 10 ||
    +state.weight > 300
  )
    return "يرجى إدخال وزن صحيح (10-300 كجم)";
  return null;
};

const validateStep3 = (state) => {
  if (!state.city || state.city.trim().length < 2) return "يرجى إدخال البلد";
  if (!state.address || state.address.trim().length < 2)
    return "يرجى إدخال المدينة";
  if (!state.healthGoal || state.healthGoal.trim().length < 3)
    return "يرجى إدخال هدفك الصحي";
  return null;
};

// ─── Password strength ────────────────────────────────────────────────────────
const getPasswordStrength = (pw) => {
  let score = 0;
  if (!pw) return { score: 0, label: "", color: "" };
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = {
    0: { label: "ضعيفة جداً", color: "#ef4444" },
    1: { label: "ضعيفة", color: "#f97316" },
    2: { label: "متوسطة", color: "#eab308" },
    3: { label: "قوية", color: "#22c55e" },
    4: { label: "قوية جداً", color: "#16a34a" },
  };
  return { score, ...map[score] };
};

// ─── Component ────────────────────────────────────────────────────────────────
const Login = () => {
  const {
    token,
    login,
    register,
    loading: authLoading,
  } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [formType, setFormType] = useState("Sign Up");
  const [step, setStep] = useState(1);
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [state, setState] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "أنثي",
    birthdate: "",
    height: "",
    weight: "",
    city: "",
    address: "",
    healthGoal: "",
    chronicDiseases: "",
  });

  const pwStrength = getPasswordStrength(state.password);

  const pageVariants = {
    initial: { opacity: 0, y: 15 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -15, transition: { duration: 0.3 } },
  };

  const stepVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.3 } },
  };

  useEffect(() => {
    if (token) {
      const from = location.state?.from?.pathname || "/";
      navigate(from);
    }
  }, [token, navigate, location]);

  const handleNextStep = (e) => {
    e.preventDefault();

    if (formType === "Sign Up") {
      // Validate current step before advancing
      let error = null;
      if (step === 1) error = validateStep1(state);
      if (step === 2) error = validateStep2(state);
      if (step === 3) error = validateStep3(state);

      if (error) {
        toast.error(error);
        return;
      }

      if (step < 3) {
        setState((p) => ({ ...p })); // keep state
        setStep((p) => p + 1);
        return;
      }

      // Step 3 submit
      onSubmitHandler();
    } else {
      // Login – validate
      if (!state.email || !EMAIL_RE.test(state.email)) {
        toast.error("يرجى إدخال بريد إلكتروني صالح");
        return;
      }
      if (!state.password) {
        toast.error("يرجى إدخال كلمة المرور");
        return;
      }
      onSubmitHandler();
    }
  };

  const onSubmitHandler = async () => {
    if (formType === "Login") {
      await login(state.email, state.password);
    } else {
      // Pass all registration data so AppContext / backend receives it
      await register(
        state.name,
        state.email,
        state.password,
        // Extra fields – adjust register() in AppContext to forward these
        {
          gender: state.gender,
          birthdate: state.birthdate,
          height: state.height,
          weight: state.weight,
          city: state.city,
          address: state.address,
          healthGoal: state.healthGoal,
          chronicDiseases: state.chronicDiseases,
        },
      );
    }
  };

  const toggleFormType = () => {
    setFormType((p) => (p === "Sign Up" ? "Login" : "Sign Up"));
    setStep(1);
    setState({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      gender: "أنثي",
      birthdate: "",
      height: "",
      weight: "",
      city: "",
      address: "",
      healthGoal: "",
      chronicDiseases: "",
    });
  };

  const set = (field) => (e) =>
    setState((p) => ({ ...p, [field]: e.target.value }));

  const inputCls =
    "w-full bg-[#1B113D]/50 border border-[#443068] rounded-xl p-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#9853D8] transition-colors";

  const stepsList = ["تفاصيل الحساب", "تفاصيل شخصيه", "تفاصيل حالتك"];

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="min-h-screen flex items-center justify-center py-10 px-4 relative overflow-hidden"
      style={{ backgroundColor: "#1B113D" }}
      dir="rtl"
    >
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 right-6 hidden md:flex items-center gap-2 text-white hover:text-gray-300 transition-colors z-20"
      >
        <ArrowRight size={20} />
        <span>رجوع</span>
      </button>

      <motion.div key={formType + step} className="w-full max-w-[600px] z-10">
        <div
          className="rounded-[24px] p-8 md:p-12 shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/5"
          style={{ backgroundColor: "#26174A" }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">دكتور أحمد</h1>
            <h2 className="text-xl font-bold text-[#A564D3] mb-2">
              {formType === "Sign Up" ? "انشاء حساب جديد" : "تسجيل الدخول"}
            </h2>
            <p className="text-gray-300 text-sm">
              ابدأ رحلتك الصحية مع دكتور أحمد الخطيب
            </p>
          </div>

          {/* Stepper for Sign Up */}
          {formType === "Sign Up" && (
            <div
              className="flex items-start justify-center w-full px-4 mb-10"
              dir="ltr"
            >
              {[
                { icon: <Lock size={20} />, label: "تفاصيل الحساب" },
                { icon: <User size={20} />, label: "تفاصيل شخصيه" },
                { icon: <Heart size={20} />, label: "تفاصيل حالتك" },
              ]
                .reverse()
                .map((s, idx) => {
                  const stepNum = 3 - idx;
                  const isActive = step >= stepNum;
                  return (
                    <React.Fragment key={stepNum}>
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? "bg-[#9853D8] text-white shadow-lg shadow-[#9853D8]/30" : "bg-[#1B113D] text-gray-400 border border-white/5"}`}
                        >
                          {s.icon}
                        </div>
                        <span className="text-xs text-gray-400 mt-3">
                          {s.label}
                        </span>
                      </div>
                      {idx < 2 && (
                        <div className="w-16 md:w-20 h-[2px] mt-6 bg-gray-500/30" />
                      )}
                    </React.Fragment>
                  );
                })}
            </div>
          )}

          <form onSubmit={handleNextStep} className="flex flex-col gap-5">
            {/* ── SIGN UP STEPS ── */}
            {formType === "Sign Up" && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex flex-col gap-5"
                >
                  {/* STEP 1 – Account details */}
                  {step === 1 && (
                    <>
                      <div className="flex items-center gap-2 text-[#A564D3] mb-2 border-b border-white/5 pb-3">
                        <Lock size={18} />
                        <span className="font-semibold">تفاصيل الحساب</span>
                      </div>

                      <div>
                        <label className="block text-white text-sm font-semibold mb-2">
                          الاسم كامل
                        </label>
                        <input
                          type="text"
                          required
                          value={state.name}
                          onChange={set("name")}
                          placeholder="ادخل اسمك كامل"
                          className={inputCls}
                        />
                      </div>

                      <div>
                        <label className="block text-white text-sm font-semibold mb-2">
                          البريد الإلكتروني
                        </label>
                        <input
                          type="email"
                          required
                          value={state.email}
                          onChange={set("email")}
                          placeholder="example@email.com"
                          dir="ltr"
                          className={inputCls + " text-right"}
                        />
                      </div>

                      <div>
                        <label className="block text-white text-sm font-semibold mb-2">
                          كلمة المرور
                        </label>
                        <div className="relative">
                          <input
                            type={showPw ? "text" : "password"}
                            required
                            value={state.password}
                            onChange={set("password")}
                            placeholder="8 أحرف على الأقل"
                            className={inputCls + " pl-12"}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPw((p) => !p)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                          >
                            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {/* Password strength meter */}
                        {state.password && (
                          <div className="mt-2">
                            <div className="flex gap-1 mb-1">
                              {[1, 2, 3, 4].map((i) => (
                                <div
                                  key={i}
                                  className="flex-1 h-1.5 rounded-full transition-all duration-300"
                                  style={{
                                    background:
                                      i <= pwStrength.score
                                        ? pwStrength.color
                                        : "#ffffff20",
                                  }}
                                />
                              ))}
                            </div>
                            <p
                              className="text-xs"
                              style={{ color: pwStrength.color }}
                            >
                              {pwStrength.label}
                            </p>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-white text-sm font-semibold mb-2">
                          تأكيد كلمة المرور
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPw ? "text" : "password"}
                            required
                            value={state.confirmPassword}
                            onChange={set("confirmPassword")}
                            placeholder="أعد كتابة كلمة المرور"
                            className={inputCls + " pl-12"}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPw((p) => !p)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                          >
                            {showConfirmPw ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>
                        {state.confirmPassword &&
                          state.password !== state.confirmPassword && (
                            <p className="text-red-400 text-xs mt-1">
                              كلمتا المرور غير متطابقتين
                            </p>
                          )}
                        {state.confirmPassword &&
                          state.password === state.confirmPassword && (
                            <p className="text-green-400 text-xs mt-1">
                              ✓ كلمتا المرور متطابقتان
                            </p>
                          )}
                      </div>
                    </>
                  )}

                  {/* STEP 2 – Personal details */}
                  {step === 2 && (
                    <>
                      <div className="flex items-center gap-2 text-[#A564D3] mb-2 border-b border-white/5 pb-3">
                        <User size={18} />
                        <span className="font-semibold">تفاصيل شخصيه</span>
                      </div>

                      {/* Gender */}
                      <div className="flex gap-4">
                        {["أنثي", "ذكر"].map((g) => (
                          <button
                            type="button"
                            key={g}
                            onClick={() =>
                              setState((p) => ({ ...p, gender: g }))
                            }
                            className={`flex-1 py-3.5 rounded-xl border flex items-center justify-center gap-2 transition-all ${state.gender === g ? "bg-[#9853D8] border-[#9853D8] text-white" : "bg-[#1B113D]/50 border-[#443068] text-gray-300"}`}
                          >
                            <span className="text-lg">
                              {g === "أنثي" ? "♀" : "♂"}
                            </span>
                            {g}
                          </button>
                        ))}
                      </div>

                      <div>
                        <label className="block text-white text-sm font-semibold mb-2">
                          تاريخ الميلاد
                        </label>
                        <input
                          type="date"
                          required
                          value={state.birthdate}
                          onChange={set("birthdate")}
                          max={new Date().toISOString().split("T")[0]}
                          className={inputCls}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white text-sm font-semibold mb-2">
                            الطول (سم)
                          </label>
                          <input
                            type="number"
                            required
                            value={state.height}
                            onChange={set("height")}
                            placeholder="مثال: 175"
                            min="50"
                            max="250"
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className="block text-white text-sm font-semibold mb-2">
                            الوزن (كجم)
                          </label>
                          <input
                            type="number"
                            required
                            value={state.weight}
                            onChange={set("weight")}
                            placeholder="مثال: 70"
                            min="10"
                            max="300"
                            className={inputCls}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* STEP 3 – Health details */}
                  {step === 3 && (
                    <>
                      <div className="flex items-center gap-2 text-[#A564D3] mb-2 border-b border-white/5 pb-3">
                        <Heart size={18} />
                        <span className="font-semibold">تفاصيل حالتك</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white text-sm font-semibold mb-2">
                            البلد
                          </label>
                          <input
                            type="text"
                            required
                            value={state.city}
                            onChange={set("city")}
                            placeholder="مصر"
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className="block text-white text-sm font-semibold mb-2">
                            المدينة
                          </label>
                          <input
                            type="text"
                            required
                            value={state.address}
                            onChange={set("address")}
                            placeholder="القاهرة"
                            className={inputCls}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-white text-sm font-semibold mb-2">
                          الهدف الصحي
                        </label>
                        <input
                          type="text"
                          required
                          value={state.healthGoal}
                          onChange={set("healthGoal")}
                          placeholder="تنظيم الغذاء، إنقاص الوزن…"
                          className={inputCls}
                        />
                      </div>

                      <div>
                        <label className="block text-white text-sm font-semibold mb-2">
                          هل تعاني من أمراض مزمنة؟
                        </label>
                        <input
                          type="text"
                          value={state.chronicDiseases}
                          onChange={set("chronicDiseases")}
                          placeholder="لا / السكري / الضغط…"
                          className={inputCls}
                        />
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            )}

            {/* ── LOGIN ── */}
            {formType === "Login" && (
              <AnimatePresence mode="wait">
                <motion.div
                  key="login"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex flex-col gap-5"
                >
                  <div>
                    <label className="block text-white text-sm font-semibold mb-2">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      required
                      value={state.email}
                      onChange={set("email")}
                      placeholder="example@email.com"
                      dir="ltr"
                      className={inputCls + " text-right"}
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm font-semibold mb-2">
                      كلمة المرور
                    </label>
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"}
                        required
                        value={state.password}
                        onChange={set("password")}
                        placeholder="كلمة المرور"
                        className={inputCls + " pl-12"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((p) => !p)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}

            {/* Back button (steps 2 & 3) */}
            {formType === "Sign Up" && step > 1 && (
              <button
                type="button"
                onClick={() => setStep((p) => p - 1)}
                className="w-full py-3 rounded-xl font-bold text-gray-300 bg-white/10 hover:bg-white/20 transition-all text-sm"
              >
                → رجوع للخطوة السابقة
              </button>
            )}

            {/* Submit / Next */}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-[#A564D3] hover:bg-[#9250BF] text-white font-bold text-lg py-4 rounded-xl mt-2 transition-all duration-300 shadow-lg shadow-[#A564D3]/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {authLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : formType === "Sign Up" && step < 3 ? (
                "التالي"
              ) : formType === "Sign Up" ? (
                "إنشاء حساب"
              ) : (
                "تسجيل الدخول"
              )}
            </button>

            {/* Toggle link */}
            <div className="text-center mt-4">
              <span className="text-gray-400 text-sm">
                {formType === "Sign Up"
                  ? "بالفعل لديك حساب؟ "
                  : "ليس لديك حساب؟ "}
                <button
                  type="button"
                  onClick={toggleFormType}
                  className="text-white hover:text-[#A564D3] transition-colors font-semibold"
                >
                  {formType === "Sign Up" ? "ادخل الآن" : "انشئ حساباً جديداً"}
                </button>
              </span>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Login;
