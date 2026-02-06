/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { DoctorContext } from "../../context/DoctorContext";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FiArrowRight,
  FiCalendar,
  FiClock,
  FiUser,
  FiPhone,
  FiMail,
  FiHome,
  FiFileText,
  FiHeart,
  FiTarget,
  FiPieChart,
  FiPackage,
  FiMessageCircle,
  FiDownload,
  FiChevronRight,
  FiChevronLeft,
  FiExternalLink,
  FiImage,
  FiFile,
} from "react-icons/fi";
import {
  Scale,
  Weight,
  Calendar as CalendarIcon,
  Pill,
  Stethoscope,
  FileText,
  AlertCircle,
} from "lucide-react";

const DoctorAppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { backendUrl, dToken } = useContext(DoctorContext);
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("medical");

  useEffect(() => {
    fetchAppointmentDetails();
  }, [id]);

  const fetchAppointmentDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${backendUrl}/api/doctor/appointments/${id}/details`,
        {
          headers: { token: dToken },
        }
      );

      console.log("📋 Appointment details response:", response.data);

      if (response.data.success) {
        console.log("📂 Files in response:", response.data.appointment.files);
        console.log(
          "🏥 Medical info in response:",
          response.data.appointment.medicalInfo
        );
        setAppointment(response.data.appointment);
      } else {
        toast.error("فشل في تحميل تفاصيل الموعد");
        navigate("/doctor/appointments");
      }
    } catch (error) {
      console.error("Error fetching appointment details:", error);
      toast.error("فشل في تحميل التفاصيل");
      navigate("/doctor/appointments");
    } finally {
      setLoading(false);
    }
  };

  // Function to view file
  // Function to view file
  // Function to view file
  const getFileExtension = (fileUrl) => {
    if (!fileUrl) return "";

    const urlLower = fileUrl.toLowerCase();

    // Check for file extensions in URL
    if (urlLower.includes(".pdf")) return ".pdf";
    if (urlLower.includes(".docx")) return ".docx";
    if (urlLower.includes(".doc") && !urlLower.includes(".docx")) return ".doc";
    if (urlLower.includes(".png")) return ".png";
    if (urlLower.includes(".jpg")) return ".jpg";
    if (urlLower.includes(".jpeg")) return ".jpeg";
    if (urlLower.includes(".gif")) return ".gif";
    if (urlLower.includes(".webp")) return ".webp";

    // For Cloudinary URLs without explicit extension
    if (urlLower.includes("cloudinary.com")) {
      // Try to detect from Cloudinary resource_type in URL
      if (urlLower.includes("/image/upload/")) {
        // Could be image, but might be PDF
        const path = urlLower.split("/image/upload/")[1] || "";
        if (path.includes(".pdf") || path.includes("pdf")) return ".pdf";
        return ".jpg"; // Default to jpg for images
      }
      if (urlLower.includes("/raw/upload/")) {
        // Raw uploads - likely documents
        return ".pdf";
      }
    }

    return "";
  };

  // Function to view file
  // Function to view file
  // Function to view file
  const viewFile = (fileUrl) => {
    if (!fileUrl) {
      toast.error("الملف غير موجود");
      return;
    }

    const extension = getFileExtension(fileUrl);

    // Word -> download only
    if (extension === ".doc" || extension === ".docx") {
      toast.info("ملفات Word لا يمكن عرضها مباشرة. سيتم تحميل الملف.");
      downloadFile(fileUrl, "مستند");
      return;
    }

    // PDF -> open through backend as inline (works even if URL private/signed)
    if (extension === ".pdf") {
      const viewUrl = `${backendUrl}/api/doctor/download-file?fileUrl=${encodeURIComponent(
        fileUrl
      )}&fileName=${encodeURIComponent("ملف")}&disposition=inline`;
      window.open(viewUrl, "_blank", "noopener,noreferrer");
      toast.info("جارٍ فتح ملف PDF...");
      return;
    }

    // Images/others -> direct
    window.open(fileUrl, "_blank", "noopener,noreferrer");
    toast.info("جارٍ فتح الملف...");
  };
  // Function to download file via backend proxy
  // Function to download file via backend proxy
  // Function to download file via backend proxy
  const downloadFile = async (fileUrl, fileName) => {
    try {
      if (!fileUrl) return toast.error("الملف غير موجود");

      const extension = getFileExtension(fileUrl);
      let finalName = fileName || "download";
      if (extension && !finalName.toLowerCase().endsWith(extension)) {
        finalName += extension;
      }

      const res = await axios.get(`${backendUrl}/api/doctor/download-file`, {
        params: { fileUrl, fileName: finalName, disposition: "attachment" },

        responseType: "blob",
      });

      const blobUrl = window.URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = finalName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);

      toast.success("جارٍ تحميل الملف...");
    } catch (err) {
      console.error("❌ Download error:", err);
      toast.error("فشل تحميل الملف");
    }
  };
  // Function to determine file type
  const getFileType = (fileUrl) => {
    if (!fileUrl) return "file";

    const isImage =
      /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(fileUrl) ||
      fileUrl.includes("image/upload") ||
      (fileUrl.includes("cloudinary.com") && fileUrl.includes("/image/"));
    const isPDF =
      /\.pdf$/i.test(fileUrl) ||
      fileUrl.includes("pdf") ||
      fileUrl.includes("application/pdf");
    const isWord = /\.(doc|docx)$/i.test(fileUrl);
    const isExcel = /\.(xls|xlsx)$/i.test(fileUrl);
    const isText = /\.txt$/i.test(fileUrl);

    if (isImage) return "image";
    if (isPDF) return "pdf";
    if (isWord) return "word";
    if (isExcel) return "excel";
    if (isText) return "text";
    return "file";
  };

  // Function to get file icon based on type
  const getFileIcon = (fileUrl) => {
    const fileType = getFileType(fileUrl);

    switch (fileType) {
      case "image":
        return <FiImage className="w-6 h-6 text-blue-500" />;
      case "pdf":
        return <FileText className="w-6 h-6 text-red-500" />;
      case "word":
        return <FiFileText className="w-6 h-6 text-blue-600" />;
      default:
        return <FiFile className="w-6 h-6 text-gray-500" />;
    }
  };

  // Function to get file type text
  const getFileTypeText = (fileUrl) => {
    const fileType = getFileType(fileUrl);

    switch (fileType) {
      case "image":
        return "صورة";
      case "pdf":
        return "ملف PDF";
      case "word":
        return "وثيقة Word";
      case "excel":
        return "ملف Excel";
      case "text":
        return "ملف نصي";
      default:
        return "ملف";
    }
  };

  // Function to extract filename from URL
  const getFileNameFromUrl = (fileUrl) => {
    if (!fileUrl) return "ملف";

    try {
      // For Cloudinary URLs, try to extract from path
      if (fileUrl.includes("cloudinary.com")) {
        const parts = fileUrl.split("/");
        const lastPart = parts[parts.length - 1];
        const fileName = lastPart.split("?")[0];

        // Decode URL encoded characters
        return decodeURIComponent(fileName) || "ملف-المريض";
      }

      // For regular URLs
      const url = new URL(fileUrl);
      const pathParts = url.pathname.split("/");
      const fileName = pathParts[pathParts.length - 1];
      return decodeURIComponent(fileName) || "ملف-المريض";
    } catch (error) {
      // If it's not a valid URL, return a generic name
      return "ملف-المريض";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "قيد الانتظار";
      case "confirmed":
        return "مؤكد";
      case "completed":
        return "مكتمل";
      case "cancelled":
        return "ملغي";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="text-gray-600">جارٍ تحميل تفاصيل الموعد...</p>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">لم يتم العثور على الموعد</p>
        <button
          onClick={() => navigate("/doctor/appointments")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          العودة للمواعيد
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => navigate("/doctor/appointments")}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">
                تفاصيل الموعد
              </h1>
            </div>
            <p className="text-gray-600">
              عرض كافة المعلومات المقدمة من المريض
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span
              className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(
                appointment.status
              )}`}
            >
              {getStatusText(appointment.status)}
            </span>
            {appointment.paid && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                ✓ مدفوع
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Basic Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Patient Info */}
        <div className="bg-white rounded-xl p-6 shadow border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-teal-100 rounded-full flex items-center justify-center">
              <FiUser className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800">
                {appointment.name}
              </h3>
              <p className="text-sm text-gray-500">المريض</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-600">
              <FiPhone className="w-4 h-4" />
              <span>{appointment.phone || "لا يوجد"}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FiMail className="w-4 h-4" />
              <span>{appointment.email}</span>
            </div>
            {appointment.userInfo?.country && (
              <div className="flex items-center gap-2 text-gray-600">
                <FiHome className="w-4 h-4" />
                <span>
                  {appointment.userInfo.city}, {appointment.userInfo.country}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Appointment Info */}
        <div className="bg-white rounded-xl p-6 shadow border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
              <FiCalendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800">الموعد</h3>
              <p className="text-sm text-gray-500">التاريخ والوقت</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-600">
              <FiCalendar className="w-4 h-4" />
              <span>{appointment.date}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FiClock className="w-4 h-4" />
              <span>{appointment.time || "غير محدد"}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FiPackage className="w-4 h-4" />
              <span>
                {appointment.service?.title_ar ||
                  appointment.service?.title ||
                  "غير محدد"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-lg">💰</span>
              <span className="font-bold">{appointment.amount || 0} جنيه</span>
            </div>
          </div>
        </div>

        {/* Service Info */}
        <div className="bg-white rounded-xl p-6 shadow border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
              <FiPieChart className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800">الخدمة</h3>
              <p className="text-sm text-gray-500">تفاصيل الخدمة</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">اسم الخدمة</p>
              <p className="font-medium">
                {appointment.service?.title_ar ||
                  appointment.service?.title ||
                  "غير محدد"}
              </p>
            </div>
            {appointment.service?.category && (
              <div>
                <p className="text-sm text-gray-500">التصنيف</p>
                <p className="font-medium">{appointment.service.category}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">سعر الخدمة</p>
              <p className="font-medium">
                {appointment.service?.fees || 0} جنيه
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap">
            <button
              onClick={() => setActiveTab("medical")}
              className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                activeTab === "medical"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4" />
                المعلومات الطبية
              </div>
            </button>
            <button
              onClick={() => setActiveTab("answers")}
              className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                activeTab === "answers"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                الأسئلة والإجابات
              </div>
            </button>
            <button
              onClick={() => setActiveTab("files")}
              className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                activeTab === "files"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <FiFileText className="w-4 h-4" />
                الملفات المرفقة
              </div>
            </button>
            <button
              onClick={() => setActiveTab("notes")}
              className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                activeTab === "notes"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <FiMessageCircle className="w-4 h-4" />
                الملاحظات
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Medical Info Tab */}
          {activeTab === "medical" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Scale className="w-4 h-4 text-blue-600" />
                    <h4 className="font-medium text-gray-800">الطول والوزن</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">الطول:</span>
                      <span className="font-medium">
                        {appointment.medicalInfo?.height || "غير مذكور"} سم
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">الوزن:</span>
                      <span className="font-medium">
                        {appointment.medicalInfo?.weight || "غير مذكور"} كجم
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">العمر:</span>
                      <span className="font-medium">
                        {appointment.medicalInfo?.age || "غير مذكور"} سنة
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FiHeart className="w-4 h-4 text-red-600" />
                    <h4 className="font-medium text-gray-800">
                      الأمراض المزمنة
                    </h4>
                  </div>
                  <p className="text-gray-700">
                    {appointment.medicalInfo?.chronicDiseases ||
                      "لا توجد أمراض مزمنة"}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Pill className="w-4 h-4 text-green-600" />
                    <h4 className="font-medium text-gray-800">
                      الأدوية الحالية
                    </h4>
                  </div>
                  <p className="text-gray-700">
                    {appointment.medicalInfo?.currentMedications ||
                      "لا يوجد أدوية حالية"}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <h3 className="font-bold text-gray-800">
                    الحالة الصحية الحالية
                  </h3>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-line">
                    {appointment.medicalInfo?.currentHealthStatus ||
                      "لم يتم ذكر الحالة الصحية"}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <FiTarget className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-gray-800">
                    الهدف من الاستشارة
                  </h3>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-line">
                    {appointment.medicalInfo?.consultationGoal ||
                      "لم يتم ذكر الهدف"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Answers Tab */}
          {activeTab === "answers" && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-blue-700 text-sm">
                  هذه الإجابات التي قدمها المريض على أسئلة الاستمارة الخاصة
                  بالخدمة
                </p>
              </div>

              {appointment.answers &&
              Object.keys(appointment.answers).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(appointment.answers).map(
                    ([questionId, answer]) => (
                      <div
                        key={questionId}
                        className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                      >
                        <h4 className="font-medium text-gray-800 mb-2">
                          {questionId}
                        </h4>
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-gray-700">
                            {answer || "لم يتم الإجابة"}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiFileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">لا توجد إجابات مسجلة</p>
                </div>
              )}
            </div>
          )}

          {/* Files Tab */}
          {activeTab === "files" && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-blue-700 text-sm">
                  الملفات التي رفعها المريض خلال عملية الحجز
                </p>
                <p className="text-blue-600 text-xs mt-1">
                  • زر "عرض": يفتح الملف في نافذة جديدة للمشاهدة
                  <br />• زر "تحميل": يقوم بتنزيل الملف على جهازك
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Medications File */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Pill className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">قائمة الأدوية</h4>
                      <p className="text-sm text-gray-500">ملف PDF أو صورة</p>
                    </div>
                  </div>

                  {appointment.files?.medicationsFile ||
                  appointment.medicalInfo?.medicationsFile ? (
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3 mb-2">
                          {getFileIcon(
                            appointment.files?.medicationsFile ||
                              appointment.medicalInfo?.medicationsFile
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {getFileNameFromUrl(
                                appointment.files?.medicationsFile ||
                                  appointment.medicalInfo?.medicationsFile
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              {getFileTypeText(
                                appointment.files?.medicationsFile ||
                                  appointment.medicalInfo?.medicationsFile
                              )}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          تم رفع الملف بنجاح
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => {
                            const url =
                              appointment.files?.medicationsFile ||
                              appointment.medicalInfo?.medicationsFile;

                            downloadFile(url, getFileNameFromUrl(url));
                          }}
                          className="py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <FiDownload className="w-4 h-4" />
                          تحميل
                        </button>

                        <button
                          onClick={() =>
                            viewFile(
                              appointment.files?.medicationsFile ||
                                appointment.medicalInfo?.medicationsFile
                            )
                          }
                          className="py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <FiExternalLink className="w-4 h-4" />
                          عرض
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FiFile className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500">لم يتم رفع ملف</p>
                    </div>
                  )}
                </div>

                {/* Tests File */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">
                        التحاليل والفحوصات
                      </h4>
                      <p className="text-sm text-gray-500">ملف PDF أو صورة</p>
                    </div>
                  </div>

                  {appointment.files?.testsFile ||
                  appointment.medicalInfo?.testsFile ? (
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3 mb-2">
                          {getFileIcon(
                            appointment.files?.testsFile ||
                              appointment.medicalInfo?.testsFile
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {getFileNameFromUrl(
                                appointment.files?.testsFile ||
                                  appointment.medicalInfo?.testsFile
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              {getFileTypeText(
                                appointment.files?.testsFile ||
                                  appointment.medicalInfo?.testsFile
                              )}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          تم رفع الملف بنجاح
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => {
                            const url =
                              appointment.files?.testsFile ||
                              appointment.medicalInfo?.testsFile;

                            downloadFile(url, getFileNameFromUrl(url));
                          }}
                          className="py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <FiDownload className="w-4 h-4" />
                          تحميل
                        </button>

                        <button
                          onClick={() =>
                            viewFile(
                              appointment.files?.testsFile ||
                                appointment.medicalInfo?.testsFile
                            )
                          }
                          className="py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <FiExternalLink className="w-4 h-4" />
                          عرض
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FiFile className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500">لم يتم رفع ملف</p>
                    </div>
                  )}
                </div>

                {/* Other Documents */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <FiFileText className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">وثائق أخرى</h4>
                      <p className="text-sm text-gray-500">ملفات إضافية</p>
                    </div>
                  </div>

                  {appointment.files?.otherDocuments ||
                  appointment.medicalInfo?.otherDocuments ? (
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3 mb-2">
                          {getFileIcon(
                            appointment.files?.otherDocuments ||
                              appointment.medicalInfo?.otherDocuments
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {getFileNameFromUrl(
                                appointment.files?.otherDocuments ||
                                  appointment.medicalInfo?.otherDocuments
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              {getFileTypeText(
                                appointment.files?.otherDocuments ||
                                  appointment.medicalInfo?.otherDocuments
                              )}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          تم رفع الملف بنجاح
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => {
                            const url =
                              appointment.files?.otherDocuments ||
                              appointment.medicalInfo?.otherDocuments;

                            downloadFile(url, getFileNameFromUrl(url));
                          }}
                          className="py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <FiDownload className="w-4 h-4" />
                          تحميل
                        </button>

                        <button
                          onClick={() =>
                            viewFile(
                              appointment.files?.otherDocuments ||
                                appointment.medicalInfo?.otherDocuments
                            )
                          }
                          className="py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <FiExternalLink className="w-4 h-4" />
                          عرض
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FiFile className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500">لم يتم رفع ملف</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === "notes" && (
            <div className="space-y-6">
              {/* Patient's Message */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <FiMessageCircle className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-gray-800">ملاحظات المريض</h3>
                </div>
                {appointment.message ? (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-line">
                      {appointment.message}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      لم يقدم المريض ملاحظات إضافية
                    </p>
                  </div>
                )}
              </div>

              {/* Doctor's Notes */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <FiMessageCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold text-gray-800">ملاحظات الطبيب</h3>
                </div>
                {appointment.doctorNotes ? (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-gray-700 whitespace-pre-line">
                      {appointment.doctorNotes}
                    </p>
                    {appointment.doctorNotesAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        آخر تحديث:{" "}
                        {new Date(appointment.doctorNotesAt).toLocaleString(
                          "ar-EG"
                        )}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">لا توجد ملاحظات من الطبيب</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Back Button */}
      <div className="flex justify-center">
        <button
          onClick={() => navigate("/doctor/appointments")}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          العودة لقائمة المواعيد
        </button>
      </div>
    </div>
  );
};

export default DoctorAppointmentDetails;
