/* eslint-disable no-unused-vars */
// src/pages/Admin/AdminServices.jsx
// Replaces both AddService.jsx + EditService.jsx + ServiceList.jsx
// Everything is handled in one page with an inline modal.
import React, { useContext, useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Eye,
  EyeOff,
  Image,
  CheckCircle,
} from "lucide-react";
import { AdminContext } from "../../context/AdminContext";
import { SERVICE_CATEGORIES } from "../../utils/constants";

// ─── Empty form shape ─────────────────────────────────────────────────────────
const EMPTY = {
  title: "",
  title_ar: "",
  category: SERVICE_CATEGORIES[0]?.en || "",
  category_ar: SERVICE_CATEGORIES[0]?.ar || "",
  description: "",
  fees: "",
  duration: "30 دقيقة",
  features: [""],
  available: true,
};

// ─── Service form (Add + Edit) ────────────────────────────────────────────────
const ServiceForm = ({ initial = EMPTY, onSubmit, onClose, loading }) => {
  const [form, setForm] = useState({ ...EMPTY, ...initial });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(initial.image || null);
  const fileRef = useRef();

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleCategory = (e) => {
    const val = e.target.value;
    const selected = SERVICE_CATEGORIES.find(
      (c) => c.ar === val || c.en === val,
    );
    setForm((p) => ({
      ...p,
      category: val, // stored in DB as Arabic
      category_ar: selected?.ar || val, // same Arabic value
    }));
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const addFeature = () =>
    setForm((p) => ({ ...p, features: [...p.features, ""] }));
  const removeFeature = (i) =>
    setForm((p) => ({
      ...p,
      features: p.features.filter((_, idx) => idx !== i),
    }));
  const updateFeature = (i, val) =>
    setForm((p) => {
      const f = [...p.features];
      f[i] = val;
      return { ...p, features: f };
    });

  const handleSubmit = () => {
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("title_ar", form.title_ar);
    fd.append("category", form.category);
    fd.append("category_ar", form.category_ar);
    fd.append("description", form.description);
    fd.append("fees", form.fees);
    fd.append("duration", form.duration);
    fd.append("available", String(form.available));
    fd.append(
      "features",
      JSON.stringify(form.features.filter((f) => f.trim())),
    );
    if (image) fd.append("image", image);
    onSubmit(fd);
  };

  const inputCls =
    "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";

  return (
    <div className="space-y-5" dir="rtl">
      {/* Image */}
      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-gray-200 rounded-2xl h-44 flex flex-col
          items-center justify-center cursor-pointer hover:border-primary transition overflow-hidden"
      >
        {preview ? (
          <img
            src={preview}
            className="w-full h-full object-cover"
            alt="preview"
          />
        ) : (
          <>
            <Image className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">صورة الخدمة</p>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImage}
        />
      </div>

      {/* Names */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الاسم (إنجليزي)
          </label>
          <input
            type="text"
            value={form.title}
            onChange={set("title")}
            placeholder="Service name"
            className={inputCls}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الاسم (عربي)
          </label>
          <input
            type="text"
            value={form.title_ar}
            onChange={set("title_ar")}
            placeholder="اسم الخدمة"
            className={inputCls}
            required
          />
        </div>
      </div>

      {/* Category + Fees */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            التخصص
          </label>
          <select
            value={form.category}
            onChange={handleCategory}
            className={inputCls}
          >
            {(Array.isArray(SERVICE_CATEGORIES) ? SERVICE_CATEGORIES : []).map(
              (c) => (
                <option key={c.en} value={c.en}>
                  {c.ar} — {c.en}
                </option>
              ),
            )}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            السعر (جنيه)
          </label>
          <input
            type="number"
            value={form.fees}
            onChange={set("fees")}
            placeholder="0"
            className={inputCls}
            required
          />
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          المدة
        </label>
        <input
          type="text"
          value={form.duration}
          onChange={set("duration")}
          placeholder="30 دقيقة"
          className={inputCls}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          الوصف
        </label>
        <textarea
          value={form.description}
          onChange={set("description")}
          rows={3}
          className={`${inputCls} resize-none`}
          required
        />
      </div>

      {/* Features */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">المميزات</label>
          <button
            type="button"
            onClick={addFeature}
            className="text-xs text-primary hover:text-secondary flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> إضافة ميزة
          </button>
        </div>
        <div className="space-y-2">
          {form.features.map((feat, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={feat}
                onChange={(e) => updateFeature(i, e.target.value)}
                placeholder={`الميزة ${i + 1}`}
                className={`${inputCls} flex-1`}
              />
              {form.features.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeFeature(i)}
                  className="p-2 text-red-400 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Available toggle */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">متاح للحجز</span>
        <button
          type="button"
          onClick={() => setForm((p) => ({ ...p, available: !p.available }))}
          className={`relative w-12 h-6 rounded-full transition-colors ${form.available ? "bg-primary" : "bg-gray-300"}`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
            ${form.available ? "translate-x-6" : "translate-x-0.5"}`}
          />
        </button>
        <span
          className={`text-xs font-medium ${form.available ? "text-green-600" : "text-gray-400"}`}
        >
          {form.available ? "مرئي للمستخدمين" : "مخفي"}
        </span>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <button
          onClick={onClose}
          className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition"
        >
          إلغاء
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl
            text-sm font-semibold hover:from-secondary hover:to-primary transition disabled:opacity-60"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              جارٍ الحفظ...
            </span>
          ) : (
            "حفظ الخدمة"
          )}
        </button>
      </div>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const AdminServices = () => {
  const {
    services,
    getServices,
    addService,
    updateService,
    deleteService,
    toggleServiceAvailability,
    loading,
  } = useContext(AdminContext);

  const [modal, setModal] = useState(null); // null | {mode:"add"|"edit", service?}
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    getServices();
  }, []);

  const handleAdd = async (fd) => {
    if (await addService(fd)) setModal(null);
  };
  const handleEdit = async (fd) => {
    if (await updateService(modal.service._id, fd)) setModal(null);
  };
  const handleDelete = async () => {
    await deleteService(deleting);
    setDeleting(null);
  };

  // Build initial form values for edit
  const editInitial = (service) => ({
    ...EMPTY,
    title: service.title || "",
    title_ar: service.title_ar || "",
    category: service.category || EMPTY.category,
    category_ar: service.category_ar || EMPTY.category_ar,
    description: service.description || "",
    fees: service.fees || "",
    duration: service.duration || "30 دقيقة",
    features: service.features?.length ? service.features : [""],
    available: service.available !== false,
    image: service.image || null,
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">الخدمات الطبية</h1>
          <p className="text-gray-500 text-sm">{services.length} خدمة</p>
        </div>
        <button
          onClick={() => setModal({ mode: "add" })}
          className="flex items-center gap-2 px-5 py-2.5
            bg-gradient-to-r from-primary to-secondary text-white rounded-xl
            font-semibold text-sm shadow-md hover:shadow-lg transition"
        >
          <Plus className="w-4 h-4" /> إضافة خدمة
        </button>
      </div>

      {/* Cards */}
      {loading && !services.length ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {services.map((service, i) => (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: i * 0.04 }}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden
                  hover:shadow-md transition-shadow
                  ${!service.available ? "border-red-100 opacity-80" : "border-gray-100"}`}
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.title_ar}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">
                      🩺
                    </div>
                  )}
                  {!service.available && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-red-500 text-white text-sm font-bold px-4 py-1.5 rounded-full">
                        غير متاح
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="font-bold text-gray-800 mb-1 truncate">
                    {service.title_ar || service.title}
                  </h3>
                  <p className="text-xs text-gray-400 mb-1">
                    {service.category_ar || service.category}
                  </p>
                  <p className="text-xl font-bold text-primary mb-4">
                    {service.fees?.toLocaleString()} جنيه
                  </p>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => toggleServiceAvailability(service._id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition
                        ${
                          service.available
                            ? "bg-green-50 text-green-700 hover:bg-green-100"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                      {service.available ? (
                        <>
                          <Eye className="w-4 h-4" /> متاح
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-4 h-4" /> مخفي
                        </>
                      )}
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setModal({ mode: "edit", service })}
                        className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition"
                        title="تعديل"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleting(service._id)}
                        className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {services.length === 0 && !loading && (
            <div className="col-span-full text-center py-20 text-gray-400">
              <CheckCircle className="w-14 h-14 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">لا توجد خدمات بعد</p>
              <p className="text-sm mt-1">
                اضغط "إضافة خدمة" لإنشاء أول خدمة طبية
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Add / Edit Modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl
                max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="sticky top-0 bg-white px-6 py-5 border-b border-gray-100
                flex items-center justify-between z-10 rounded-t-3xl"
              >
                <h2 className="text-xl font-bold text-gray-800">
                  {modal.mode === "add" ? "إضافة خدمة جديدة" : "تعديل الخدمة"}
                </h2>
                <button
                  onClick={() => setModal(null)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6">
                <ServiceForm
                  initial={modal.service ? editInitial(modal.service) : EMPTY}
                  onSubmit={modal.mode === "add" ? handleAdd : handleEdit}
                  onClose={() => setModal(null)}
                  loading={loading}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirm ───────────────────────────────────────────────────── */}
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
                حذف الخدمة
              </h3>
              <p className="text-gray-500 text-sm mb-5">
                هل أنت متأكد؟ لا يمكن التراجع.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleting(null)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 text-sm"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 text-sm font-semibold disabled:opacity-60"
                >
                  {loading ? "..." : "حذف"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminServices;
