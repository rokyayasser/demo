/* eslint-disable no-unused-vars */
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

// API
import { appointmentApi } from "../../api/appointment.api";

// Context
import { AppContext } from "../../context/AppContext";

// Icons
import {
  Calendar,
  Clock,
  DollarSign,
  User,
  Mail,
  Phone,
  FileText,
  Scale,
  Weight,
  Heart,
  Pill,
  Stethoscope,
  Target,
  Upload,
  Globe,
  MapPin,
  Activity,
} from "lucide-react";

const AppointmentForm = ({
  selectedDate,
  selectedCategory,
  serviceId,
  serviceFees,
  serviceInfo,
}) => {
  const { token, userData, api } = useContext(AppContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(0.02);
  const [usdAmount, setUsdAmount] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      country: "",
      city: "",
      notes: "",
    },
    medicalInfo: {
      height: "",
      weight: "",
      age: "",
      chronicDiseases: "",
      currentMedications: "",
      currentHealthStatus: "",
      consultationGoal: "",
    },
    files: {
      medicationsFile: null,
      testsFile: null,
    },
  });

  // Initialize form with user data
  useEffect(() => {
    if (userData) {
      const nameParts = userData.name?.split(" ") || [];
      setFormData((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          email: userData.email || "",
          phone: userData.phone || "",
          country: userData.address?.country || "",
          city: userData.address?.city || "",
        },
      }));
    }
  }, [userData]);

  // Fetch exchange rate
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await api.get("/api/v1/currency/rate");
        if (response.data.success) {
          setExchangeRate(response.data.rate);
        }
      } catch (error) {
        console.error("Failed to fetch exchange rate:", error);
      }
    };
    fetchExchangeRate();
  }, [api]);

  // Calculate USD amount
  useEffect(() => {
    const usd = serviceFees * exchangeRate;
    setUsdAmount(parseFloat(usd.toFixed(2)));
  }, [serviceFees, exchangeRate]);

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleFileChange = (field, file) => {
    setFormData((prev) => ({
      ...prev,
      files: {
        ...prev.files,
        [field]: file,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const requiredFields = [
        "height",
        "weight",
        "age",
        "chronicDiseases",
        "currentHealthStatus",
        "consultationGoal",
      ];

      const missingFields = requiredFields.filter(
        (field) => !formData.medicalInfo[field]?.trim(),
      );

      if (missingFields.length > 0) {
        toast.error("يرجى ملء جميع المعلومات الطبية الأساسية");
        setLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      const [date, time] = selectedDate.split(" - ");
      formDataToSend.append("serviceId", serviceId);
      formDataToSend.append("date", date);
      formDataToSend.append("time", time || "");
      formDataToSend.append("category", selectedCategory);
      formDataToSend.append("message", formData.personalInfo.notes || "");
      formDataToSend.append("amount", serviceFees.toString());

      Object.entries(formData.medicalInfo).forEach(([key, value]) => {
        formDataToSend.append(key, value || "");
      });

      Object.entries(formData.personalInfo).forEach(([key, value]) => {
        if (key !== "notes") {
          formDataToSend.append(key, value || "");
        }
      });

      if (formData.files.medicationsFile) {
        formDataToSend.append(
          "medicationsFile",
          formData.files.medicationsFile,
        );
      }
      if (formData.files.testsFile) {
        formDataToSend.append("testsFile", formData.files.testsFile);
      }

      const response = await appointmentApi.bookAppointment(formDataToSend);

      if (response.success) {
        toast.success(response.message || "تم حجز الموعد بنجاح!");
        setTimeout(() => {
          navigate("/my-appointments");
        }, 2000);
      } else {
        toast.error(response.message || "حدث خطأ أثناء الحجز");
      }
    } catch (error) {
      console.error("Booking error:", error);
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage || "حدث خطأ أثناء الحجز");
    } finally {
      setLoading(false);
    }
  };

  if (!userData) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#9b61db] border-t-transparent"></div>
      </div>
    );
  }

  // Common classes for inputs and textareas
  const inputClass =
    "w-full border border-white/10 bg-[#0a051d]/50 rounded-xl px-12 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#9b61db] focus:ring-1 focus:ring-[#9b61db] transition-all";
  const textareaClass =
    "w-full border border-white/10 bg-[#0a051d]/50 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#9b61db] focus:ring-1 focus:ring-[#9b61db] transition-all resize-none";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto"
      dir="rtl"
    >
      <div className="bg-white/5 border border-white/10 rounded-[2rem] shadow-[0_0_40px_rgba(0,0,0,0.3)] overflow-hidden backdrop-blur-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#8349c7] to-[#9b61db] p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 relative z-10">
            إتمام معلومات الحجز
          </h2>
          <p className="text-center opacity-90 relative z-10 text-sm md:text-base">
            يرجى إكمال البيانات التالية بعناية لضمان أفضل جودة للخدمة
          </p>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* Service Details Summary */}
          <div className="bg-[#0a051d]/40 rounded-2xl p-6 border border-white/5">
            <h3 className="text-lg font-bold text-[#9b61db] mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              تفاصيل الخدمة
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">الخدمة المختارة</p>
                <p className="text-white font-medium">
                  {serviceInfo?.title || selectedCategory}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">التاريخ والوقت</p>
                <p
                  className="text-white font-medium flex items-center gap-2"
                  dir="ltr"
                >
                  {selectedDate} <Clock className="w-4 h-4 text-[#9b61db]" />
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">السعر (EGP)</p>
                <p className="text-[#9b61db] font-bold text-xl">
                  {serviceFees} جنية
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">السعر (USD)</p>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <p className="text-green-400 font-bold text-xl">
                    ${usdAmount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Personal Information */}
            <div>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="p-2 bg-[#2d1b5a] rounded-lg">
                  <User className="w-5 h-5 text-[#9b61db]" />
                </div>
                المعلومات الشخصية
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="relative">
                  <label className="block text-gray-300 font-medium mb-2 text-sm">
                    الاسم الأول <span className="text-red-500">*</span>
                  </label>
                  <User className="absolute right-4 top-[2.6rem] text-gray-500 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.personalInfo.firstName}
                    onChange={(e) =>
                      handleInputChange(
                        "personalInfo",
                        "firstName",
                        e.target.value,
                      )
                    }
                    required
                    placeholder="الاسم الأول"
                    className={inputClass}
                  />
                </div>

                <div className="relative">
                  <label className="block text-gray-300 font-medium mb-2 text-sm">
                    اسم العائلة <span className="text-red-500">*</span>
                  </label>
                  <User className="absolute right-4 top-[2.6rem] text-gray-500 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.personalInfo.lastName}
                    onChange={(e) =>
                      handleInputChange(
                        "personalInfo",
                        "lastName",
                        e.target.value,
                      )
                    }
                    required
                    placeholder="اسم العائلة"
                    className={inputClass}
                  />
                </div>

                <div className="relative">
                  <label className="block text-gray-300 font-medium mb-2 text-sm">
                    البريد الإلكتروني <span className="text-red-500">*</span>
                  </label>
                  <Mail className="absolute right-4 top-[2.6rem] text-gray-500 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.personalInfo.email}
                    onChange={(e) =>
                      handleInputChange("personalInfo", "email", e.target.value)
                    }
                    required
                    placeholder="example@email.com"
                    dir="ltr"
                    className={inputClass}
                  />
                </div>

                <div className="relative">
                  <label className="block text-gray-300 font-medium mb-2 text-sm">
                    رقم الهاتف <span className="text-red-500">*</span>
                  </label>
                  <Phone className="absolute right-4 top-[2.6rem] text-gray-500 w-5 h-5" />
                  <input
                    type="tel"
                    value={formData.personalInfo.phone}
                    onChange={(e) =>
                      handleInputChange("personalInfo", "phone", e.target.value)
                    }
                    required
                    placeholder="+20 1XX XXX XXXX"
                    dir="ltr"
                    className={inputClass}
                  />
                </div>

                <div className="relative">
                  <label className="block text-gray-300 font-medium mb-2 text-sm">
                    الدولة <span className="text-red-500">*</span>
                  </label>
                  <Globe className="absolute right-4 top-[2.6rem] text-gray-500 w-5 h-5" />
                  <select
                    value={formData.personalInfo.country}
                    onChange={(e) =>
                      handleInputChange(
                        "personalInfo",
                        "country",
                        e.target.value,
                      )
                    }
                    required
                    className="w-full border border-white/10 bg-[#0a051d] text-white rounded-xl px-12 py-3.5 focus:outline-none focus:border-[#9b61db] transition-all appearance-none"
                  >
                    <option value="" disabled>
                      اختر الدولة
                    </option>
                    <option value="egypt">مصر</option>
                    <option value="saudi">المملكة العربية السعودية</option>
                    <option value="uae">الإمارات العربية المتحدة</option>
                    <option value="other">دولة أخرى</option>
                  </select>
                </div>

                <div className="relative">
                  <label className="block text-gray-300 font-medium mb-2 text-sm">
                    المدينة <span className="text-red-500">*</span>
                  </label>
                  <MapPin className="absolute right-4 top-[2.6rem] text-gray-500 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.personalInfo.city}
                    onChange={(e) =>
                      handleInputChange("personalInfo", "city", e.target.value)
                    }
                    required
                    placeholder="أدخل مدينتك"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div>
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="p-2 bg-[#2d1b5a] rounded-lg">
                  <Stethoscope className="w-5 h-5 text-[#9b61db]" />
                </div>
                المعلومات الطبية الأساسية
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                يرجى تعبئة هذه البيانات بدقة لأنها الأساس الذي يبني عليه الدكتور
                تقييمه.
              </p>

              <div className="space-y-6">
                {/* Physical Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="relative">
                    <label className="block text-gray-300 font-medium mb-2 text-sm">
                      الطول (سم) <span className="text-red-500">*</span>
                    </label>
                    <Scale className="absolute right-4 top-[2.6rem] text-gray-500 w-5 h-5" />
                    <input
                      type="number"
                      value={formData.medicalInfo.height}
                      onChange={(e) =>
                        handleInputChange(
                          "medicalInfo",
                          "height",
                          e.target.value,
                        )
                      }
                      required
                      min="50"
                      max="250"
                      step="0.1"
                      placeholder="مثال: 175"
                      className={inputClass}
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-gray-300 font-medium mb-2 text-sm">
                      الوزن (كجم) <span className="text-red-500">*</span>
                    </label>
                    <Weight className="absolute right-4 top-[2.6rem] text-gray-500 w-5 h-5" />
                    <input
                      type="number"
                      value={formData.medicalInfo.weight}
                      onChange={(e) =>
                        handleInputChange(
                          "medicalInfo",
                          "weight",
                          e.target.value,
                        )
                      }
                      required
                      min="10"
                      max="300"
                      step="0.1"
                      placeholder="مثال: 70"
                      className={inputClass}
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-gray-300 font-medium mb-2 text-sm">
                      العمر <span className="text-red-500">*</span>
                    </label>
                    <Calendar className="absolute right-4 top-[2.6rem] text-gray-500 w-5 h-5" />
                    <input
                      type="number"
                      value={formData.medicalInfo.age}
                      onChange={(e) =>
                        handleInputChange("medicalInfo", "age", e.target.value)
                      }
                      required
                      min="1"
                      max="120"
                      placeholder="مثال: 30"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Textareas */}
                <div>
                  <label className="block text-gray-300 font-medium mb-2 text-sm flex items-center gap-2">
                    <Heart className="w-4 h-4 text-[#9b61db]" /> الأمراض المزمنة{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.medicalInfo.chronicDiseases}
                    onChange={(e) =>
                      handleInputChange(
                        "medicalInfo",
                        "chronicDiseases",
                        e.target.value,
                      )
                    }
                    required
                    placeholder="اذكر الأمراض المزمنة (مثل السكري، الضغط). إذا لم يوجد اكتب 'لا يوجد'"
                    rows="2"
                    className={textareaClass}
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-2 text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#9b61db]" /> الحالة
                    الصحية الحالية <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.medicalInfo.currentHealthStatus}
                    onChange={(e) =>
                      handleInputChange(
                        "medicalInfo",
                        "currentHealthStatus",
                        e.target.value,
                      )
                    }
                    required
                    placeholder="صف حالتك والأعراض التي تعاني منها بالتفصيل"
                    rows="3"
                    className={textareaClass}
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-2 text-sm flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#9b61db]" /> الهدف من
                    الاستشارة <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.medicalInfo.consultationGoal}
                    onChange={(e) =>
                      handleInputChange(
                        "medicalInfo",
                        "consultationGoal",
                        e.target.value,
                      )
                    }
                    required
                    placeholder="ما الذي تأمل في تحقيقه من خلال هذه الاستشارة؟"
                    rows="2"
                    className={textareaClass}
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-2 text-sm flex items-center gap-2">
                    <Pill className="w-4 h-4 text-[#9b61db]" /> الأدوية الحالية{" "}
                    <span className="text-gray-500 text-xs">
                      (اختياري - إن لم ترفع ملف)
                    </span>
                  </label>
                  <textarea
                    value={formData.medicalInfo.currentMedications}
                    onChange={(e) =>
                      handleInputChange(
                        "medicalInfo",
                        "currentMedications",
                        e.target.value,
                      )
                    }
                    placeholder="اذكر جميع الأدوية والجرعات الحالية"
                    rows="2"
                    className={textareaClass}
                  />
                </div>

                {/* File Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
                  {/* Upload 1 */}
                  <div className="bg-[#0a051d]/50 border border-white/5 rounded-2xl p-5">
                    <label className="block text-white font-medium mb-2 flex items-center gap-2">
                      <Pill className="w-4 h-4 text-[#9b61db]" /> رفع وصفات
                      الأدوية{" "}
                      <span className="text-gray-500 text-xs">(اختياري)</span>
                    </label>
                    <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:bg-white/5 transition-colors group cursor-pointer relative">
                      <input
                        type="file"
                        onChange={(e) =>
                          handleFileChange("medicationsFile", e.target.files[0])
                        }
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      <Upload className="w-8 h-8 text-gray-500 group-hover:text-[#9b61db] transition-colors mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">
                        اسحب الملف هنا أو اضغط للاختيار
                      </p>

                      {formData.files.medicationsFile && (
                        <div className="mt-3 inline-block bg-[#9b61db]/20 text-[#9b61db] px-3 py-1 rounded-lg text-xs font-medium truncate max-w-full">
                          {formData.files.medicationsFile.name}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload 2 */}
                  <div className="bg-[#0a051d]/50 border border-white/5 rounded-2xl p-5">
                    <label className="block text-white font-medium mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#9b61db]" /> رفع
                      التحاليل/الفحوصات{" "}
                      <span className="text-gray-500 text-xs">(اختياري)</span>
                    </label>
                    <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:bg-white/5 transition-colors group cursor-pointer relative">
                      <input
                        type="file"
                        onChange={(e) =>
                          handleFileChange("testsFile", e.target.files[0])
                        }
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      <Upload className="w-8 h-8 text-gray-500 group-hover:text-[#9b61db] transition-colors mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">
                        اسحب الملف هنا أو اضغط للاختيار
                      </p>

                      {formData.files.testsFile && (
                        <div className="mt-3 inline-block bg-[#9b61db]/20 text-[#9b61db] px-3 py-1 rounded-lg text-xs font-medium truncate max-w-full">
                          {formData.files.testsFile.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Summary and Submit */}
            <div className="bg-gradient-to-r from-[#8349c7]/10 to-[#9b61db]/10 rounded-xl p-6 border border-white/10">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    ملخص الحجز
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-gray-400 text-sm">السعر (EGP)</p>
                      <p className="text-2xl font-bold text-white">
                        {serviceFees} جنيه
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-sm">السعر (USD)</p>
                      <p className="text-2xl font-bold text-green-400">
                        ${usdAmount}
                      </p>
                    </div>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-[#8349c7] to-[#9b61db] text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-[0_0_20px_rgba(155,97,219,0.4)] transition-all duration-300 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      جاري تأكيد الحجز...
                    </div>
                  ) : (
                    "تأكيد الحجز"
                  )}
                </motion.button>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-gray-400 text-sm text-center">
                  ✓ سيتم التواصل معك عبر البريد الإلكتروني أو الهاتف لتأكيد
                  الموعد
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default AppointmentForm;
