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
        // You might want to create a currency API endpoint
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

  // Handle input change
  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  // Handle file change
  const handleFileChange = (field, file) => {
    setFormData((prev) => ({
      ...prev,
      files: {
        ...prev.files,
        [field]: file,
      },
    }));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required medical fields
      const requiredFields = [
        "height",
        "weight",
        "age",
        "chronicDiseases",
        "currentHealthStatus",
        "consultationGoal",
      ];

      const missingFields = requiredFields.filter(
        (field) => !formData.medicalInfo[field]?.trim()
      );

      if (missingFields.length > 0) {
        toast.error("يرجى ملء جميع المعلومات الطبية الأساسية");
        setLoading(false);
        return;
      }

      // Create FormData
      const formDataToSend = new FormData();

      // Add appointment data
      const [date, time] = selectedDate.split(" - ");
      formDataToSend.append("serviceId", serviceId);
      formDataToSend.append("date", date);
      formDataToSend.append("time", time || "");
      formDataToSend.append("category", selectedCategory);
      formDataToSend.append("message", formData.personalInfo.notes || "");
      formDataToSend.append("amount", serviceFees.toString());

      // Add medical info
      Object.entries(formData.medicalInfo).forEach(([key, value]) => {
        formDataToSend.append(key, value || "");
      });

      // Add personal info
      Object.entries(formData.personalInfo).forEach(([key, value]) => {
        if (key !== "notes") {
          formDataToSend.append(key, value || "");
        }
      });

      // Add files
      if (formData.files.medicationsFile) {
        formDataToSend.append(
          "medicationsFile",
          formData.files.medicationsFile
        );
      }
      if (formData.files.testsFile) {
        formDataToSend.append("testsFile", formData.files.testsFile);
      }

      // Submit appointment
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto my-10"
      dir="rtl"
    >
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-borderLight">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
          <h2 className="text-2xl font-bold text-center mb-2">تفاصيل الحجز</h2>
          <p className="text-center opacity-90">
            استكمال معلومات الحجز النهائية
          </p>
        </div>

        <div className="p-6">
          {/* Service Details Card */}
          <div className="bg-lightBg rounded-xl p-6 mb-8 border border-borderLight">
            <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              تفاصيل الخدمة
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-textMain font-semibold mb-2">
                  الخدمة المختارة
                </p>
                <p className="text-textSoft">
                  {serviceInfo?.title || selectedCategory}
                </p>
              </div>

              <div>
                <p className="text-textMain font-semibold mb-2">
                  التاريخ والوقت
                </p>
                <div className="flex items-center gap-2 text-textSoft">
                  <Clock className="w-4 h-4" />
                  {selectedDate}
                </div>
              </div>

              <div>
                <p className="text-textMain font-semibold mb-2">السعر (EGP)</p>
                <p className="text-2xl font-bold text-primary">
                  {serviceFees} جنيه
                </p>
              </div>

              <div>
                <p className="text-textMain font-semibold mb-2">السعر (USD)</p>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <p className="text-2xl font-bold text-green-600">
                    ${usdAmount}
                  </p>
                  <span className="text-xs text-textSoft">
                    (سعر الصرف: 1 دولار = {(1 / exchangeRate).toFixed(2)} جنيه)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="bg-white rounded-xl p-6 border border-borderLight">
              <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                <User className="w-5 h-5" />
                المعلومات الشخصية
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-textMain font-medium mb-2">
                    الاسم الأول
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.firstName}
                    onChange={(e) =>
                      handleInputChange(
                        "personalInfo",
                        "firstName",
                        e.target.value
                      )
                    }
                    required
                    className="w-full border border-borderLight rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="block text-textMain font-medium mb-2">
                    اسم العائلة
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.lastName}
                    onChange={(e) =>
                      handleInputChange(
                        "personalInfo",
                        "lastName",
                        e.target.value
                      )
                    }
                    required
                    className="w-full border border-borderLight rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="block text-textMain font-medium mb-2">
                    البريد الإلكتروني
                  </label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-textSoft" />
                    <input
                      type="email"
                      value={formData.personalInfo.email}
                      onChange={(e) =>
                        handleInputChange(
                          "personalInfo",
                          "email",
                          e.target.value
                        )
                      }
                      required
                      className="w-full border border-borderLight rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-textMain font-medium mb-2">
                    رقم الهاتف
                  </label>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-textSoft" />
                    <input
                      type="tel"
                      value={formData.personalInfo.phone}
                      onChange={(e) =>
                        handleInputChange(
                          "personalInfo",
                          "phone",
                          e.target.value
                        )
                      }
                      required
                      className="w-full border border-borderLight rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="+966 50 123 4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-textMain font-medium mb-2">
                    الدولة
                  </label>
                  <select
                    value={formData.personalInfo.country}
                    onChange={(e) =>
                      handleInputChange(
                        "personalInfo",
                        "country",
                        e.target.value
                      )
                    }
                    required
                    className="w-full border border-borderLight rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">اختر الدولة</option>
                    <option value="saudi">المملكة العربية السعودية</option>
                    <option value="uae">الإمارات العربية المتحدة</option>
                    <option value="egypt">مصر</option>
                    <option value="other">دولة أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="block text-textMain font-medium mb-2">
                    المدينة
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.city}
                    onChange={(e) =>
                      handleInputChange("personalInfo", "city", e.target.value)
                    }
                    required
                    className="w-full border border-borderLight rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
            </div>

            {/* Medical Information Section */}
            <div className="bg-white rounded-xl p-6 border border-borderLight">
              <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                <Stethoscope className="w-5 h-5" />
                المعلومات الطبية الأساسية
              </h3>
              <p className="text-textSoft mb-6 text-sm">
                برجاء ملء جميع الحقول المطلوبة بدقة للمساعدة في تقديم أفضل رعاية
                صحية
              </p>

              <div className="space-y-6">
                {/* Height, Weight, Age Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-textMain font-medium mb-2 flex items-center gap-2">
                      <Scale className="w-4 h-4" />
                      الطول (سم)
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.medicalInfo.height}
                      onChange={(e) =>
                        handleInputChange(
                          "medicalInfo",
                          "height",
                          e.target.value
                        )
                      }
                      required
                      min="50"
                      max="250"
                      step="0.1"
                      placeholder="مثال: 175"
                      className="w-full border border-borderLight rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <div>
                    <label className="block text-textMain font-medium mb-2 flex items-center gap-2">
                      <Weight className="w-4 h-4" />
                      الوزن (كجم)
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.medicalInfo.weight}
                      onChange={(e) =>
                        handleInputChange(
                          "medicalInfo",
                          "weight",
                          e.target.value
                        )
                      }
                      required
                      min="10"
                      max="300"
                      step="0.1"
                      placeholder="مثال: 70"
                      className="w-full border border-borderLight rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <div>
                    <label className="block text-textMain font-medium mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      العمر (سنة)
                      <span className="text-red-500">*</span>
                    </label>
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
                      className="w-full border border-borderLight rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>

                {/* Chronic Diseases */}
                <div>
                  <label className="block text-textMain font-medium mb-2 flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    الأمراض المزمنة
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.medicalInfo.chronicDiseases}
                    onChange={(e) =>
                      handleInputChange(
                        "medicalInfo",
                        "chronicDiseases",
                        e.target.value
                      )
                    }
                    required
                    placeholder="اذكر جميع الأمراض المزمنة التي تعاني منها (مثل: السكري، الضغط، الربو، إلخ). إذا لم يكن لديك أمراض مزمنة، اكتب 'لا يوجد'"
                    rows="3"
                    className="w-full border border-borderLight rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                {/* File Uploads Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Medications File Upload */}
                  <div className="bg-lightBg p-4 rounded-lg border border-borderLight">
                    <label className="block text-textMain font-medium mb-3 flex items-center gap-2">
                      <Pill className="w-4 h-4" />
                      رفع قائمة الأدوية
                      <span className="text-xs text-textSoft">(اختياري)</span>
                    </label>
                    <p className="text-textSoft text-sm mb-3">
                      يمكنك رفع صورة أو ملف PDF لقائمة الأدوية الحالية التي
                      تتناولها
                    </p>

                    <div className="border-2 border-dashed border-borderLight rounded-lg p-4 text-center">
                      <Upload className="w-8 h-8 text-textSoft mx-auto mb-2" />
                      <p className="text-textMain text-sm mb-2">
                        رفع ملف الأدوية
                      </p>

                      <label className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors text-sm">
                        اختر ملف
                        <input
                          type="file"
                          onChange={(e) =>
                            handleFileChange(
                              "medicationsFile",
                              e.target.files[0]
                            )
                          }
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        />
                      </label>

                      {formData.files.medicationsFile && (
                        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                          <p className="text-green-700 text-sm flex items-center gap-2">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {formData.files.medicationsFile.name}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tests File Upload */}
                  <div className="bg-lightBg p-4 rounded-lg border border-borderLight">
                    <label className="block text-textMain font-medium mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      رفع التحاليل والفحوصات
                      <span className="text-xs text-textSoft">(اختياري)</span>
                    </label>
                    <p className="text-textSoft text-sm mb-3">
                      يمكنك رفع صور أو ملفات PDF للتحاليل والفحوصات الطبية
                      الأخيرة
                    </p>

                    <div className="border-2 border-dashed border-borderLight rounded-lg p-4 text-center">
                      <Upload className="w-8 h-8 text-textSoft mx-auto mb-2" />
                      <p className="text-textMain text-sm mb-2">
                        رفع ملف التحاليل
                      </p>

                      <label className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors text-sm">
                        اختر ملف
                        <input
                          type="file"
                          onChange={(e) =>
                            handleFileChange("testsFile", e.target.files[0])
                          }
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        />
                      </label>

                      {formData.files.testsFile && (
                        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                          <p className="text-green-700 text-sm flex items-center gap-2">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {formData.files.testsFile.name}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Current Health Status */}
                <div>
                  <label className="block text-textMain font-medium mb-2">
                    الحالة الصحية الحالية
                    <span className="text-red-500 mr-1">*</span>
                  </label>
                  <textarea
                    value={formData.medicalInfo.currentHealthStatus}
                    onChange={(e) =>
                      handleInputChange(
                        "medicalInfo",
                        "currentHealthStatus",
                        e.target.value
                      )
                    }
                    required
                    placeholder="صف حالتك الصحية الحالية بشكل مفصل، بما في ذلك الأعراض والمشاكل الصحية التي تعاني منها حالياً"
                    rows="4"
                    className="w-full border border-borderLight rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                {/* Current Medications (Text) */}
                <div>
                  <label className="block text-textMain font-medium mb-2 flex items-center gap-2">
                    <Pill className="w-4 h-4" />
                    الأدوية الحالية (كتابة)
                    <span className="text-xs text-textSoft">
                      (اختياري - إذا لم ترفع ملف)
                    </span>
                  </label>
                  <textarea
                    value={formData.medicalInfo.currentMedications}
                    onChange={(e) =>
                      handleInputChange(
                        "medicalInfo",
                        "currentMedications",
                        e.target.value
                      )
                    }
                    placeholder="اذكر جميع الأدوية التي تتناولها حالياً مع الجرعات والتكرار. مثال: باراسيتامول 500mg مرتين يومياً"
                    rows="3"
                    className="w-full border border-borderLight rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                {/* Consultation Goal */}
                <div>
                  <label className="block text-textMain font-medium mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    الهدف من الاستشارة
                    <span className="text-red-500 mr-1">*</span>
                  </label>
                  <textarea
                    value={formData.medicalInfo.consultationGoal}
                    onChange={(e) =>
                      handleInputChange(
                        "medicalInfo",
                        "consultationGoal",
                        e.target.value
                      )
                    }
                    required
                    placeholder="ما الذي تأمل في تحقيقه من خلال هذه الاستشارة؟ وما هي توقعاتك من الطبيب؟"
                    rows="3"
                    className="w-full border border-borderLight rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
            </div>

            {/* Summary and Submit */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-primary/20">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <h3 className="text-xl font-bold text-primary mb-2">
                    ملخص الحجز
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-textSoft text-sm">السعر (EGP)</p>
                      <p className="text-2xl font-bold text-primary">
                        {serviceFees} جنيه
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-textSoft text-sm">السعر (USD)</p>
                      <p className="text-2xl font-bold text-green-600">
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
                  className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-secondary hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
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

              <div className="mt-6 pt-6 border-t border-borderLight">
                <p className="text-textSoft text-sm text-center">
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
