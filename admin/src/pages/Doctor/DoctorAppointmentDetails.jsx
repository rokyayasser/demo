// pages/Doctor/DoctorAppointmentDetails.jsx
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  Stethoscope,
  FileText,
  Download,
  Paperclip,
  Pill,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  MessageSquare,
  Target,
  Weight,
  Ruler,
  Heart,
} from "lucide-react";
import { DoctorContext } from "../../context/DoctorContext";
import api from "../../services/api.config";

const STATUS_AR = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  completed: "مكتمل",
  cancelled: "ملغي",
};
const STATUS_CLS = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  confirmed: "bg-blue-100   text-blue-700   border-blue-200",
  completed: "bg-green-100  text-green-700  border-green-200",
  cancelled: "bg-red-100    text-red-700    border-red-200",
};

// ── Helper: download a file from a URL ────────────────────────────────────────
const downloadFile = async (url, filename) => {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename || "file";
    a.click();
    URL.revokeObjectURL(a.href);
  } catch {
    // Fallback: open in new tab
    window.open(url, "_blank");
  }
};

// ── Info row ──────────────────────────────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value, className = "" }) => {
  if (!value && value !== 0) return null;
  return (
    <div
      className={`flex items-start gap-3 py-3 border-b border-gray-100 last:border-0 ${className}`}
    >
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-800 break-words">{value}</p>
      </div>
    </div>
  );
};

// ── File card with download button ────────────────────────────────────────────
const FileCard = ({ url, name, label }) => {
  const isImage =
    /\.(jpg|jpeg|png|webp|gif)$/i.test(url) || url.includes("image");
  const isPdf = /\.pdf$/i.test(url) || url.includes("pdf");

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        {isImage ? (
          <img
            src={url}
            alt={name}
            className="w-10 h-10 rounded-lg object-cover cursor-pointer"
            onClick={() => window.open(url, "_blank")}
          />
        ) : (
          <FileText className="w-5 h-5 text-primary" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-700 truncate">
          {name || label}
        </p>
        <p className="text-xs text-gray-400">
          {isPdf ? "PDF" : isImage ? "صورة" : "ملف"}
        </p>
      </div>
      <div className="flex gap-1.5">
        <button
          onClick={() => window.open(url, "_blank")}
          className="p-1.5 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition"
          title="عرض"
        >
          <Paperclip className="w-4 h-4" />
        </button>
        <button
          onClick={() => downloadFile(url, name || label)}
          className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition"
          title="تحميل"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default function DoctorAppointmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dToken } = useContext(DoctorContext);

  const [apt, setApt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/api/v1/doctor/appointments/${id}`, {
          headers: { token: dToken },
        });
        if (data.success) setApt(data.data?.appointment || data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, dToken]);

  const handleStatus = async (status) => {
    setUpdating(true);
    try {
      await api.put(
        `/api/v1/doctor/appointments/${id}/status`,
        { status },
        { headers: { token: dToken } },
      );
      setApt((p) => ({ ...p, status }));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );

  if (!apt)
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">لم يتم العثور على الموعد</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-primary underline text-sm"
        >
          رجوع
        </button>
      </div>
    );

  const patientName =
    apt.name || `${apt.firstName || ""} ${apt.lastName || ""}`.trim() || "—";
  const hasTests = apt.testsFiles?.length > 0 || apt.testsFile;
  const hasMeds = apt.medicationsFile || apt.currentMedications;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto" dir="rtl">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition mb-6 text-sm"
      >
        <ArrowRight className="w-4 h-4" /> العودة للتقويم
      </button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-l from-primary to-[#4c1d95] rounded-2xl p-6 text-white mb-6"
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-white/70 text-sm mb-1">تفاصيل الموعد</p>
            <h1 className="text-2xl font-bold">{patientName}</h1>
            <p className="text-white/80 text-sm mt-1">
              {apt.service?.title_ar || apt.category || "استشارة"} — {apt.date}{" "}
              {apt.time}
            </p>
          </div>
          <span
            className={`px-4 py-1.5 rounded-full text-sm font-bold border ${STATUS_CLS[apt.status] || "bg-gray-100 text-gray-700"}`}
          >
            {STATUS_AR[apt.status] || apt.status}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-5 flex-wrap">
          {apt.status === "pending" && (
            <button
              onClick={() => handleStatus("confirmed")}
              disabled={updating}
              className="flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition"
            >
              <CheckCircle className="w-4 h-4" /> تأكيد الموعد
            </button>
          )}
          {apt.status === "confirmed" && (
            <button
              onClick={() => handleStatus("completed")}
              disabled={updating}
              className="flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition"
            >
              <CheckCircle className="w-4 h-4" /> تحديد كمكتمل
            </button>
          )}
          {(apt.status === "pending" || apt.status === "confirmed") && (
            <button
              onClick={() => handleStatus("cancelled")}
              disabled={updating}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-500/30 hover:bg-red-500/40 rounded-xl text-sm font-medium transition"
            >
              <XCircle className="w-4 h-4" /> إلغاء الموعد
            </button>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Patient info ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
        >
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> بيانات المريض
          </h2>
          <InfoRow icon={User} label="الاسم" value={patientName} />
          <InfoRow icon={Mail} label="البريد الإلكتروني" value={apt.email} />
          <InfoRow icon={Phone} label="رقم الجوال" value={apt.phone} />
          <InfoRow icon={Calendar} label="تاريخ الموعد" value={apt.date} />
          <InfoRow icon={Clock} label="وقت الموعد" value={apt.time} />
        </motion.div>

        {/* ── Health info ───────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
        >
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" /> البيانات الصحية
          </h2>
          <InfoRow
            icon={Ruler}
            label="الطول (سم)"
            value={apt.height && apt.height !== "0" ? apt.height : null}
          />
          <InfoRow
            icon={Weight}
            label="الوزن (كج)"
            value={apt.weight && apt.weight !== "0" ? apt.weight : null}
          />
          <InfoRow
            icon={User}
            label="العمر"
            value={apt.age && apt.age !== "0" ? apt.age : null}
          />
          <InfoRow
            icon={Heart}
            label="الأمراض المزمنة"
            value={
              apt.chronicDiseases !== "لا يوجد" ? apt.chronicDiseases : null
            }
          />
          <InfoRow
            icon={Stethoscope}
            label="الحالة الصحية الحالية"
            value={apt.currentHealthStatus}
          />
          <InfoRow
            icon={Target}
            label="هدف الاستشارة"
            value={apt.consultationGoal || apt.message}
          />
        </motion.div>

        {/* ── Medications ───────────────────────────────────────────────────── */}
        {hasMeds && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
          >
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Pill className="w-5 h-5 text-primary" /> الأدوية الحالية
            </h2>

            {apt.currentMedications && (
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {apt.currentMedications}
                </p>
              </div>
            )}

            {apt.medicationsFile && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">
                  ملف الوصفة الطبية
                </p>
                <FileCard
                  url={apt.medicationsFile}
                  name="وصفة الأدوية"
                  label="medications"
                />
              </div>
            )}
          </motion.div>
        )}

        {/* ── Medical tests ─────────────────────────────────────────────────── */}
        {hasTests && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
          >
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> التحاليل الطبية
              {apt.testsFiles?.length > 0 && (
                <span className="mr-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                  {apt.testsFiles.length} ملف
                </span>
              )}
            </h2>

            {/* Download all button */}
            {apt.testsFiles?.length > 1 && (
              <button
                onClick={() =>
                  apt.testsFiles.forEach((f, i) =>
                    setTimeout(
                      () => downloadFile(f.url, f.name || `تحليل-${i + 1}`),
                      i * 300,
                    ),
                  )
                }
                className="w-full flex items-center justify-center gap-2 py-2 mb-4
                  bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-sm font-medium transition"
              >
                <Download className="w-4 h-4" />
                تحميل جميع التحاليل ({apt.testsFiles.length})
              </button>
            )}

            <div className="space-y-2">
              {/* New multi-file format */}
              {apt.testsFiles?.map((f, i) => (
                <FileCard
                  key={i}
                  url={f.url}
                  name={f.name || `تحليل ${i + 1}`}
                  label={`test-${i + 1}`}
                />
              ))}
              {/* Legacy single file */}
              {!apt.testsFiles?.length && apt.testsFile && (
                <FileCard
                  url={apt.testsFile}
                  name="التحليل الطبي"
                  label="test"
                />
              )}
            </div>
          </motion.div>
        )}

        {/* ── Notes / message ───────────────────────────────────────────────── */}
        {apt.message && apt.message !== apt.consultationGoal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:col-span-2"
          >
            <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" /> ملاحظات المريض
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4">
              {apt.message}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
