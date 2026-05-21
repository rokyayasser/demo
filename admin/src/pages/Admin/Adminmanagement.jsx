// pages/Admin/AdminManagement.jsx
import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  X,
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
} from "lucide-react";
import { AdminContext } from "../../context/AdminContext";
import api from "../../services/api.config";
import { toast } from "react-toastify";

const EMPTY = { name: "", email: "", password: "", role: "admin" };

const AdminManagement = () => {
  const { aToken } = useContext(AdminContext);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const authH = { headers: { token: aToken } };

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/v1/admin/admins", authH);
      if (data.success) setAdmins(data.data?.admins || []);
    } catch {
      toast.error("فشل تحميل المسؤولين");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.error("جميع الحقول مطلوبة");
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post("/api/v1/admin/admins", form, authH);
      if (data.success) {
        toast.success("تم إنشاء المسؤول");
        setModal(false);
        setForm(EMPTY);
        load();
      } else toast.error(data.message);
    } catch (e) {
      toast.error(e.response?.data?.message || "حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/v1/admin/admins/${deleting}`, authH);
      toast.success("تم حذف المسؤول");
      setDeleting(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "فشل الحذف");
    }
  };

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const cls =
    "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة المسؤولين</h1>
          <p className="text-gray-500 text-sm mt-1">{admins.length} مسؤول</p>
        </div>
        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-2 px-5 py-2.5
            bg-gradient-to-r from-primary to-secondary text-white rounded-xl
            font-semibold text-sm shadow-md hover:shadow-lg transition"
        >
          <Plus className="w-4 h-4" /> إضافة مسؤول
        </button>
      </div>

      {/* Admin list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {admins.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>لا يوجد مسؤولون بعد</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-right px-6 py-3 text-gray-500 font-medium">
                    الاسم
                  </th>
                  <th className="text-right px-6 py-3 text-gray-500 font-medium">
                    البريد
                  </th>
                  <th className="text-right px-6 py-3 text-gray-500 font-medium">
                    الصلاحية
                  </th>
                  <th className="text-right px-6 py-3 text-gray-500 font-medium">
                    تاريخ الإنشاء
                  </th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {admins.map((admin, i) => (
                    <motion.tr
                      key={admin._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary
                            flex items-center justify-center text-white font-bold text-sm"
                          >
                            {admin.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-800">
                            {admin.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{admin.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold
                          ${
                            admin.role === "superadmin"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {admin.role === "superadmin" ? (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5" /> سوبر أدمن
                            </>
                          ) : (
                            <>
                              <Shield className="w-3.5 h-3.5" /> أدمن
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {new Date(admin.createdAt).toLocaleDateString("ar-EG")}
                      </td>
                      <td className="px-6 py-4 text-left">
                        <button
                          onClick={() => setDeleting(admin._id)}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Create modal */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  إضافة مسؤول جديد
                </h2>
                <button
                  onClick={() => setModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4" dir="rtl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الاسم *
                  </label>
                  <input
                    value={form.name}
                    onChange={set("name")}
                    placeholder="اسم المسؤول"
                    className={cls}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    البريد الإلكتروني *
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    placeholder="admin@example.com"
                    className={cls}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    كلمة المرور *
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={set("password")}
                    placeholder="8 أحرف على الأقل"
                    className={cls}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الصلاحية
                  </label>
                  <select
                    value={form.role}
                    onChange={set("role")}
                    className={cls}
                  >
                    <option value="admin">
                      أدمن — إدارة المحتوى والمواعيد
                    </option>
                    <option value="superadmin">
                      سوبر أدمن — كامل الصلاحيات بما فيها إدارة الأدمن
                    </option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setModal(false)}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 text-sm"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={saving}
                    className="flex-1 py-2.5 bg-gradient-to-r from-primary to-secondary text-white
                      rounded-xl text-sm font-semibold disabled:opacity-60 hover:shadow-md transition"
                  >
                    {saving ? "جارٍ الإنشاء..." : "إنشاء الحساب"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40"
              onClick={() => setDeleting(null)}
            />
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center"
            >
              <Trash2 className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <h3 className="font-bold text-gray-800 text-lg mb-1">
                حذف المسؤول
              </h3>
              <p className="text-gray-500 text-sm mb-5">
                هل أنت متأكد؟ لا يمكن التراجع.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleting(null)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600"
                >
                  حذف
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminManagement;
