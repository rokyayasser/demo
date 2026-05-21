// pages/Admin/AdminProfile.jsx
import React, { useState, useContext, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  Shield,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";
import { AdminContext } from "../../context/AdminContext";
import api from "../../services/api.config";
import { toast } from "react-toastify";

const Section = ({ title, icon: Icon, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
  >
    <h2 className="font-bold text-gray-800 text-lg mb-5 flex items-center gap-2">
      <Icon className="w-5 h-5 text-primary" />
      {title}
    </h2>
    {children}
  </motion.div>
);

const Input = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  right,
  disabled,
}) => {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={isPass && show ? "text" : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
            focus:outline-none focus:ring-2 focus:ring-primary/40
            disabled:bg-gray-50 disabled:text-gray-400"
        />
        {isPass && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {show ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

const AdminProfile = () => {
  const { aToken, adminData, adminLogin } = useContext(AdminContext);
  const authH = { headers: { token: aToken } };

  // Profile form
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [pwd, setPwd] = useState({ current: "", newPwd: "", confirm: "" });
  const [savingPwd, setSavingPwd] = useState(false);

  // Load current profile
  useEffect(() => {
    if (adminData) {
      setProfile({ name: adminData.name || "", email: adminData.email || "" });
    } else {
      api
        .get("/api/v1/admin/me", authH)
        .then((res) => {
          if (res.data.success) {
            const a = res.data.data?.admin;
            setProfile({ name: a.name || "", email: a.email || "" });
          }
        })
        .catch(() => {});
    }
  }, [adminData]);

  // Save profile
  const handleSaveProfile = async () => {
    if (!profile.name.trim() || !profile.email.trim()) {
      toast.error("الاسم والبريد مطلوبان");
      return;
    }
    setSavingProfile(true);
    try {
      const { data } = await api.put("/api/v1/admin/me", profile, authH);
      if (data.success) {
        toast.success("تم تحديث الملف الشخصي");
        // Update localStorage
        const updated = { ...adminData, ...profile };
        localStorage.setItem("adminData", JSON.stringify(updated));
      } else toast.error(data.message);
    } catch (e) {
      toast.error(e.response?.data?.message || "حدث خطأ");
    } finally {
      setSavingProfile(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (!pwd.current || !pwd.newPwd || !pwd.confirm) {
      toast.error("جميع حقول كلمة المرور مطلوبة");
      return;
    }
    if (pwd.newPwd !== pwd.confirm) {
      toast.error("كلمة المرور الجديدة غير متطابقة");
      return;
    }
    if (pwd.newPwd.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    setSavingPwd(true);
    try {
      const { data } = await api.put(
        "/api/v1/admin/me/password",
        {
          currentPassword: pwd.current,
          newPassword: pwd.newPwd,
        },
        authH,
      );
      if (data.success) {
        toast.success("تم تغيير كلمة المرور");
        setPwd({ current: "", newPwd: "", confirm: "" });
      } else toast.error(data.message);
    } catch (e) {
      toast.error(e.response?.data?.message || "حدث خطأ");
    } finally {
      setSavingPwd(false);
    }
  };

  const role = adminData?.role;

  return (
    <div className="space-y-6 max-w-2xl" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">الملف الشخصي</h1>
        <p className="text-gray-500 text-sm mt-1">
          إدارة بياناتك الشخصية وكلمة المرور
        </p>
      </div>

      {/* Avatar + role badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-l from-primary to-[#4c2885] rounded-2xl p-6 text-white flex items-center gap-5"
      >
        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold shrink-0">
          {profile.name?.charAt(0)?.toUpperCase() || "A"}
        </div>
        <div>
          <h2 className="text-xl font-bold">{profile.name || "—"}</h2>
          <p className="text-white/70 text-sm">{profile.email}</p>
          <span
            className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-bold
            ${role === "superadmin" ? "bg-white/20 text-white" : "bg-white/10 text-white/80"}`}
          >
            {role === "superadmin" ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" /> سوبر أدمن
              </>
            ) : (
              <>
                <Shield className="w-3.5 h-3.5" /> أدمن
              </>
            )}
          </span>
        </div>
      </motion.div>

      {/* Edit profile */}
      <Section title="تعديل البيانات الشخصية" icon={User}>
        <div className="space-y-4">
          <Input
            label="الاسم"
            value={profile.name}
            onChange={(e) =>
              setProfile((p) => ({ ...p, name: e.target.value }))
            }
            placeholder="اسمك الكامل"
          />
          <Input
            label="البريد الإلكتروني"
            type="email"
            value={profile.email}
            onChange={(e) =>
              setProfile((p) => ({ ...p, email: e.target.value }))
            }
            placeholder="email@example.com"
          />
          <button
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-secondary
              text-white rounded-xl text-sm font-semibold hover:shadow-md transition disabled:opacity-60"
          >
            {savingProfile ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            حفظ التغييرات
          </button>
        </div>
      </Section>

      {/* Change password */}
      <Section title="تغيير كلمة المرور" icon={Lock}>
        <div className="space-y-4">
          <Input
            label="كلمة المرور الحالية"
            type="password"
            value={pwd.current}
            onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))}
            placeholder="أدخل كلمة المرور الحالية"
          />
          <Input
            label="كلمة المرور الجديدة"
            type="password"
            value={pwd.newPwd}
            onChange={(e) => setPwd((p) => ({ ...p, newPwd: e.target.value }))}
            placeholder="6 أحرف على الأقل"
          />
          <Input
            label="تأكيد كلمة المرور الجديدة"
            type="password"
            value={pwd.confirm}
            onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))}
            placeholder="أعد كتابة كلمة المرور"
          />
          {pwd.newPwd && pwd.confirm && pwd.newPwd !== pwd.confirm && (
            <p className="text-red-500 text-xs">كلمة المرور غير متطابقة</p>
          )}
          {pwd.newPwd &&
            pwd.confirm &&
            pwd.newPwd === pwd.confirm &&
            pwd.newPwd.length >= 6 && (
              <p className="text-green-500 text-xs flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> كلمة المرور متطابقة
              </p>
            )}
          <button
            onClick={handleChangePassword}
            disabled={savingPwd}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-secondary
              text-white rounded-xl text-sm font-semibold hover:shadow-md transition disabled:opacity-60"
          >
            {savingPwd ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            تغيير كلمة المرور
          </button>
        </div>
      </Section>
    </div>
  );
};

export default AdminProfile;
