/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import { MapPin, Phone, UserRound } from "lucide-react";
import Button from "../../components/common/Button";

// ============================================================
// MyProfile Component
//
// TODO (Backend Developer):
// This component is now connected to AppContext.
// The API logic (mocked for now) is located in `src/context/AppContext.jsx`.
// You will need to replace the mock functions inside AppContext with your real API calls.
// ============================================================

const MyProfile = () => {
  // --- Get user data and functions from AppContext ---
  const {
    userData,
    updateUserProfile,
    loading: authLoading,
  } = useContext(AppContext);

  const [state, setState] = useState({
    isEdit: false,
    formData: {
      name: "",
      phone: "",
      address: { line1: "", line2: "" },
      gender: "Male",
      dob: "",
      image: null,
    },
  });

  const pageVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
    exit: { opacity: 0 },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    if (userData) {
      setState((prev) => ({
        ...prev,
        formData: {
          name: userData.name || "",
          phone: userData.phone || "",
          address: userData.address || { line1: "", line2: "" },
          gender: userData.gender || "Male",
          dob: userData.dob || "",
          image: null,
        },
      }));
    }
  }, [userData]);

  const handleSave = async () => {
    // The loading state is now handled by AppContext's `authLoading`

    const data = new FormData();
    data.append("name", state.formData.name);
    data.append("phone", state.formData.phone);
    data.append("address", JSON.stringify(state.formData.address));
    data.append("gender", state.formData.gender);
    data.append("dob", state.formData.dob);

    if (state.formData.image) {
      data.append("image", state.formData.image);
    }

    // --- FRONTEND MOCK & BACKEND HOOK ---
    // The `updateUserProfile` function is now handled by AppContext.
    // TODO (Backend Developer): The real API call is inside `src/context/AppContext.jsx`.
    const result = await updateUserProfile(data);

    if (result) {
      toast.success("✅ تم تحديث الملف الشخصي بنجاح");
      // AppContext will automatically reload userData
      setState((prev) => ({ ...prev, isEdit: false }));
    } else {
      toast.error("❌ فشل تحديث الملف الشخصي");
    }
  };

  const handleCancel = () => {
    if (userData) {
      setState((prev) => ({
        ...prev,
        isEdit: false,
        formData: {
          name: userData.name || "",
          phone: userData.phone || "",
          address: userData.address || { line1: "", line2: "" },
          gender: userData.gender || "Male",
          dob: userData.dob || "",
          image: null,
        },
      }));
    }
  };

  const handleInputChange = (field, value) => {
    setState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value,
      },
    }));
  };

  const handleAddressChange = (field, value) => {
    setState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        address: {
          ...prev.formData.address,
          [field]: value,
        },
      },
    }));
  };

  if (!userData && authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-textSoft text-lg">جاري تحميل البيانات...</p>
        </motion.div>
      </div>
    );
  }

  if (!userData && !authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-4">
            خطأ في تحميل البيانات
          </h2>
          <p className="text-textSoft">يرجى تسجيل الدخول مرة أخرى.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        className="min-h-screen pt-42 pb-16 px-4 relative overflow-hidden"
        dir="rtl"
      >
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-[#2d1b5a]/30 via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-[#13072e]/40 to-transparent pointer-events-none"></div>

        <div className="max-w-7xl mx-auto w-full space-y-8">
          <motion.div
            variants={itemVariants}
            className="w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden"
          >
            <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
              {/* Avatar Area */}
              <div className="relative">
                <label className="cursor-pointer group block">
                  <img
                    src={
                      state.formData.image
                        ? URL.createObjectURL(state.formData.image)
                        : userData.image || "https://via.placeholder.com/150"
                    }
                    alt="Profile"
                    className="w-28 h-28 rounded-full object-cover border-4 border-white/20 shadow-xl group-hover:opacity-90 transition-opacity bg-white/10"
                  />
                  <div className="absolute bottom-1 left-2 w-5 h-5 bg-green-500 border-2 border-[#34185e] rounded-full z-10"></div>

                  {/* Overlay for upload icon on hover */}
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleInputChange("image", e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              {/* User Details Area */}
              <div className="flex-1 text-center md:text-right">
                <p className="text-gray-400 text-sm mb-1">طالب</p>
                {state.isEdit ? (
                  <input
                    type="text"
                    value={state.formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="text-3xl font-bold mb-3 bg-transparent border-b-2 border-white/20 focus:border-white/50 outline-none transition-colors w-full md:w-auto"
                  />
                ) : (
                  <h2 className="text-3xl font-bold mb-3">
                    {state.formData.name || "اسم المستخدم"}
                  </h2>
                )}
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 text-sm text-gray-200">
                  <span className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    {userData.email}
                  </span>
                  <span className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    عضو منذ{" "}
                    {new Date(userData.createdAt).toLocaleDateString("ar-SA", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </span>

                  <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors py-1.5 px-4 rounded-md mt-2 md:mt-0">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                    مشاركة الملف الشخصي
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Detailed Information */}
          <motion.div variants={itemVariants} className="w-full">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl p-8">
              <motion.h3
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-2xl font-bold text-white mb-6 pb-4 border-b border-white/10"
              >
                المعلومات الشخصية
              </motion.h3>

              <div className="space-y-8">
                {/* Contact Information */}
                <motion.div variants={itemVariants} className="rounded-xl p-6">
                  <h4 className="text-xl font-bold  mb-4 flex items-center gap-2">
                    <Phone />
                    معلومات الاتصال
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 font-medium mb-2">
                        رقم الهاتف
                      </label>
                      {state.isEdit ? (
                        <motion.input
                          whileFocus={{ scale: 1.02 }}
                          className="w-full border border-white/10 bg-[#0a051d]/50 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#9b61db] focus:ring-1 focus:ring-[#9b61db] transition-all"
                          type="tel"
                          value={state.formData.phone}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                          placeholder="أدخل رقم هاتفك"
                        />
                      ) : (
                        <p className="text-white font-semibold text-lg p-3.5 rounded-xl border border-white/10 bg-[#0a051d]/50">
                          {state.formData.phone || "غير محدد"}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-gray-400 font-medium mb-2">
                        البريد الإلكتروني
                      </label>
                      <p className="text-white font-semibold text-lg p-3.5 rounded-xl border border-white/10 bg-[#0a051d]/50">
                        {userData.email}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Address Information */}
                <motion.div variants={itemVariants} className="rounded-xl p-6">
                  <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <MapPin />
                    العنوان
                  </h4>
                  <div className="space-y-4">
                    {state.isEdit ? (
                      <>
                        <div>
                          <label className="block text-gray-400 font-medium mb-2">
                            العنوان الأساسي
                          </label>
                          <motion.input
                            whileFocus={{ scale: 1.02 }}
                            className="w-full border border-white/10 bg-[#0a051d]/50 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#9b61db] focus:ring-1 focus:ring-[#9b61db] transition-all"
                            type="text"
                            value={state.formData.address.line1}
                            onChange={(e) =>
                              handleAddressChange("line1", e.target.value)
                            }
                            placeholder="العنوان الأساسي"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 font-medium mb-2">
                            العنوان التفصيلي (اختياري)
                          </label>
                          <motion.input
                            whileFocus={{ scale: 1.02 }}
                            className="w-full border border-white/10 bg-[#0a051d]/50 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#9b61db] focus:ring-1 focus:ring-[#9b61db] transition-all"
                            type="text"
                            value={state.formData.address.line2}
                            onChange={(e) =>
                              handleAddressChange("line2", e.target.value)
                            }
                            placeholder="العنوان التفصيلي (اختياري)"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <div>
                          <label className="block text-gray-400 font-medium mb-1">
                            العنوان الأساسي
                          </label>
                          <p className="text-white font-semibold text-lg p-3.5 rounded-xl border border-white/10 bg-[#0a051d]/50">
                            {state.formData.address.line1 || "غير محدد"}
                          </p>
                        </div>
                        {state.formData.address.line2 && (
                          <div>
                            <label className="block text-gray-400 font-medium mb-1">
                              العنوان التفصيلي
                            </label>
                            <p className="text-gray-300 p-3.5 rounded-xl border border-white/10 bg-[#0a051d]/50">
                              {state.formData.address.line2}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Personal Information */}
                <motion.div variants={itemVariants} className="rounded-xl p-6">
                  <h4 className="text-xl font-bold  mb-4 flex items-center gap-2">
                    <UserRound />
                    المعلومات الشخصية
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 font-medium mb-2">
                        الجنس
                      </label>
                      {state.isEdit ? (
                        <motion.select
                          whileFocus={{ scale: 1.02 }}
                          className="w-full border border-white/10 bg-[#0a051d]/50 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#9b61db] focus:ring-1 focus:ring-[#9b61db] transition-all appearance-none"
                          value={state.formData.gender}
                          onChange={(e) =>
                            handleInputChange("gender", e.target.value)
                          }
                        >
                          <option value="Male">ذكر</option>
                          <option value="Female">أنثى</option>
                        </motion.select>
                      ) : (
                        <p className="text-white font-semibold text-lg p-3.5 rounded-xl border border-white/10 bg-[#0a051d]/50">
                          {state.formData.gender === "Male" ? "ذكر" : "أنثى"}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-gray-400 font-medium mb-2">
                        تاريخ الميلاد
                      </label>
                      {state.isEdit ? (
                        <motion.input
                          whileFocus={{ scale: 1.02 }}
                          className="w-full border border-white/10 bg-[#0a051d]/50 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#9b61db] focus:ring-1 focus:ring-[#9b61db] transition-all"
                          type="date"
                          value={state.formData.dob}
                          onChange={(e) =>
                            handleInputChange("dob", e.target.value)
                          }
                        />
                      ) : (
                        <p className="text-white font-semibold text-lg p-3.5 rounded-xl border border-white/10 bg-[#0a051d]/50">
                          {state.formData.dob
                            ? new Date(state.formData.dob).toLocaleDateString(
                                "ar-SA",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )
                            : "غير محدد"}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t border-white/10">
                  <Button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      state.isEdit
                        ? handleSave()
                        : setState((prev) => ({ ...prev, isEdit: true }))
                    }
                    disabled={authLoading}
                    className={`flex-1 w-full py-3.5 rounded-xl font-bold text-lg transition-all duration-300 ${
                      state.isEdit
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg hover:shadow-green-500/30"
                        : "bg-gradient-to-r from-[#8349c7] to-[#9b61db] hover:shadow-lg hover:shadow-[#9b61db]/30"
                    } text-white shadow-md disabled:opacity-70 disabled:cursor-not-allowed`}
                  >
                    {authLoading && state.isEdit ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        جاري الحفظ...
                      </div>
                    ) : state.isEdit ? (
                      "حفظ التغييرات"
                    ) : (
                      "تعديل الملف الشخصي"
                    )}
                  </Button>

                  {state.isEdit && (
                    <motion.button
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCancel}
                      disabled={authLoading}
                      className="py-3.5 px-8 rounded-xl font-bold bg-white/10 text-white hover:bg-white/20 transition-all duration-300 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      إلغاء
                    </motion.button>
                  )}
                </div>
              </div>
            </div>

            {/* Mock Data Notice for Developers */}
            <motion.div
              variants={itemVariants}
              className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5"
              dir="ltr"
            >
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <div>
                  <h5 className="font-bold text-amber-800 text-sm">
                    Developer Notice — Mock Data in Use
                  </h5>
                  <p className="text-amber-700 text-xs mt-1">
                    This component is connected to{" "}
                    <code className="bg-amber-100 px-1 rounded">
                      AppContext
                    </code>
                    . The actual API logic (currently mocked) is located in{" "}
                    <code className="bg-amber-100 px-1 rounded">
                      src/context/AppContext.jsx
                    </code>
                    . Please update the functions{" "}
                    <code className="bg-amber-100 px-1 rounded">
                      updateUserProfile
                    </code>{" "}
                    and{" "}
                    <code className="bg-amber-100 px-1 rounded">
                      loadUserProfileData
                    </code>{" "}
                    there.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default MyProfile;
