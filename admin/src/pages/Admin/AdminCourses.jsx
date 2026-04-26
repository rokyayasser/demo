/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  BookOpen,
  Link,
  Image,
  Eye,
  EyeOff,
  Users,
  Clock,
} from "lucide-react";
import { AdminContext } from "../../context/AdminContext";

// ─── Default empty form ───────────────────────────────────────────────────────
const EMPTY_FORM = {
  title: "", // English title
  title_ar: "", // Arabic title
  description: "",
  description_ar: "",
  category: "",
  price: "",
  duration: "", // e.g. "10 ساعات"
  totalLessons: "",
  instructor: "د. أحمد الخطيب",
  // ─── THE KEY FIELD ────────────────────────────────────────────────────────
  // Stored in MongoDB with select:false — NEVER returned by public API.
  // Only returned by GET /api/v1/courses/learn/:id after verifying paid enrollment.
  playlistUrl: "",
  // ──────────────────────────────────────────────────────────────────────────
  features: "", // comma-separated, will be split before sending
  tags: "",
  available: true,
};

// ─── Reusable text field ──────────────────────────────────────────────────────
const Field = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  accent = "violet",
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
        focus:outline-none focus:ring-2
        ${accent === "violet" ? "focus:ring-violet-400" : "focus:ring-blue-400"}`}
    />
  </div>
);

// ─── Course form (used for both Add and Edit) ─────────────────────────────────
const CourseForm = ({ initial = EMPTY_FORM, onSubmit, onClose, loading }) => {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initial });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(initial.image || null);
  const fileRef = useRef();

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = () => {
    const fd = new FormData();

    // Append every text field
    fd.append("title", form.title);
    fd.append("title_ar", form.title_ar);
    fd.append("description", form.description);
    fd.append("description_ar", form.description_ar);
    fd.append("category", form.category);
    fd.append("price", form.price);
    fd.append("duration", form.duration);
    fd.append("totalLessons", form.totalLessons);
    fd.append("instructor", form.instructor);
    fd.append("available", String(form.available));

    // ── playlistUrl — sent to backend, stored with select:false ──
    // The controller saves it but NEVER exposes it in public list/detail responses.
    // It is returned ONLY by /courses/learn/:id after enrollment verification.
    fd.append("playlistUrl", form.playlistUrl.trim());

    // Arrays — split by comma
    const featureArr = form.features
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);
    fd.append("features", JSON.stringify(featureArr));

    const tagArr = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    fd.append("tags", JSON.stringify(tagArr));

    // Image (optional on edit)
    if (image) fd.append("image", image);

    onSubmit(fd);
  };

  return (
    <div className="space-y-5" dir="rtl">
      {/* ── Image uploader ────────────────────────────────────────────────── */}
      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-gray-200 rounded-2xl h-44 flex flex-col
          items-center justify-center cursor-pointer hover:border-violet-400 transition
          overflow-hidden relative bg-gray-50"
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
            <p className="text-sm text-gray-400">اختر صورة الكورس</p>
            <p className="text-xs text-gray-300 mt-1">JPG, PNG — حتى 5MB</p>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
      </div>

      {/* ── Basic info ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="العنوان (عربي)"
          value={form.title_ar}
          onChange={set("title_ar")}
          placeholder="اسم الكورس بالعربية"
        />
        <Field
          label="العنوان (إنجليزي)"
          value={form.title}
          onChange={set("title")}
          placeholder="Course title"
        />
        <Field
          label="الفئة / التخصص"
          value={form.category}
          onChange={set("category")}
          placeholder="مثال: تغذية، صحة عامة"
        />
        <Field
          label="السعر (جنيه)"
          value={form.price}
          onChange={set("price")}
          type="number"
          placeholder="0"
        />
        <Field
          label="المدة الإجمالية"
          value={form.duration}
          onChange={set("duration")}
          placeholder="مثال: 10 ساعات"
        />
        <Field
          label="عدد الدروس"
          value={form.totalLessons}
          onChange={set("totalLessons")}
          type="number"
          placeholder="0"
        />
        <Field
          label="المدرب"
          value={form.instructor}
          onChange={set("instructor")}
          placeholder="د. أحمد الخطيب"
        />
      </div>

      {/* ── Descriptions ─────────────────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          الوصف (عربي)
        </label>
        <textarea
          value={form.description_ar}
          onChange={set("description_ar")}
          rows={3}
          placeholder="وصف مختصر للكورس..."
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
            focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
        />
      </div>

      {/* ── playlistUrl — THE PROTECTED FIELD ───────────────────────────── */}
      <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4">
        <label className="flex items-center gap-2 text-sm font-semibold text-violet-800 mb-1">
          <Link className="w-4 h-4" />
          رابط قائمة تشغيل YouTube (Unlisted Playlist)
        </label>
        <input
          type="url"
          name="playlistUrl"
          value={form.playlistUrl}
          onChange={set("playlistUrl")}
          placeholder="https://www.youtube.com/playlist?list=PL..."
          className="w-full px-4 py-2.5 border border-violet-300 rounded-xl text-sm bg-white
            focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
        <div className="mt-2 space-y-1 text-xs text-violet-600">
          <p>
            🔒 هذا الرابط <strong>لا يظهر</strong> في أي API عام — يُحفظ في
            قاعدة البيانات بـ <code>select: false</code>.
          </p>
          <p>
            📧 يُرسَل تلقائياً للمشترك عبر البريد الإلكتروني بعد إتمام الدفع.
          </p>
          <p>
            ✅ يمكن للمشترك مشاهدته فقط عبر صفحة <code>/learn/:id</code> بعد
            التحقق من الاشتراك المدفوع.
          </p>
        </div>
      </div>

      {/* ── Features & Tags ────────────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          المميزات{" "}
          <span className="text-gray-400 font-normal">(افصل بفاصلة)</span>
        </label>
        <input
          type="text"
          value={form.features}
          onChange={set("features")}
          placeholder="خطة غذائية مخصصة, متابعة أسبوعية, شهادة إتمام"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
            focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          الوسوم{" "}
          <span className="text-gray-400 font-normal">(افصل بفاصلة)</span>
        </label>
        <input
          type="text"
          value={form.tags}
          onChange={set("tags")}
          placeholder="تغذية, دايت, صحة"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
            focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
      </div>

      {/* ── Available toggle ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 py-1">
        <span className="text-sm font-medium text-gray-700">متاح للبيع</span>
        <button
          type="button"
          onClick={() => setForm((p) => ({ ...p, available: !p.available }))}
          className={`relative w-12 h-6 rounded-full transition-colors duration-200
            ${form.available ? "bg-violet-500" : "bg-gray-300"}`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow
              transition-transform duration-200
              ${form.available ? "translate-x-6" : "translate-x-0.5"}`}
          />
        </button>
        <span
          className={`text-xs font-medium ${form.available ? "text-green-600" : "text-gray-400"}`}
        >
          {form.available ? "ظاهر للمستخدمين" : "مخفي"}
        </span>
      </div>

      {/* ── Actions ──────────────────────────────────────────────────────── */}
      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl
            text-sm hover:bg-gray-50 transition-colors"
        >
          إلغاء
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600
            text-white rounded-xl text-sm font-semibold
            hover:from-violet-700 hover:to-purple-700 transition
            disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              جارٍ الحفظ...
            </span>
          ) : (
            "حفظ الكورس"
          )}
        </button>
      </div>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const AdminCourses = () => {
  const {
    courses,
    getCourses,
    addCourse,
    updateCourse,
    deleteCourse,
    loading,
  } = useContext(AdminContext);

  const [modal, setModal] = useState(null); // null | { mode:"add"|"edit", course? }
  const [deleting, setDeleting] = useState(null); // course._id to delete

  useEffect(() => {
    getCourses();
  }, []);

  const handleAdd = async (fd) => {
    const ok = await addCourse(fd);
    if (ok) setModal(null);
  };
  const handleEdit = async (fd) => {
    const ok = await updateCourse(modal.course._id, fd);
    if (ok) setModal(null);
  };
  const handleDelete = async () => {
    await deleteCourse(deleting);
    setDeleting(null);
  };

  // Build initial form values for edit — flatten nested fields
  // playlistUrl is fetched via the admin endpoint GET /courses/admin/:id
  const editInitial = (course) => ({
    ...EMPTY_FORM,
    title: course.title || "",
    title_ar: course.title_ar || "",
    description: course.description || "",
    description_ar: course.description_ar || "",
    category: course.category || "",
    price: course.price || "",
    duration: course.duration || "",
    totalLessons: course.totalLessons || "",
    instructor: course.instructor || "د. أحمد الخطيب",
    // playlistUrl comes from admin endpoint — may be "" if not yet fetched
    playlistUrl: course.playlistUrl || "",
    features: (course.features || [])
      .map((f) => (typeof f === "string" ? f : f.text || ""))
      .join(", "),
    tags: (course.tags || []).join(", "),
    available: course.available !== false,
    image: course.image || null,
  });

  // When admin clicks edit, fetch the course WITH playlistUrl from the admin endpoint
  const handleOpenEdit = async (course) => {
    try {
      // Import api at module level if not already — this uses the admin token
      const { default: api } = await import("../../services/api.config");
      const { data } = await api.get(`/api/v1/courses/admin/${course._id}`);
      const full = data.success ? data.data?.course || course : course;
      setModal({ mode: "edit", course: full });
    } catch {
      // Fallback: open with what we have (playlistUrl will be blank)
      setModal({ mode: "edit", course });
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">الكورسات</h1>
          <p className="text-gray-500 text-sm">{courses.length} كورس مسجل</p>
        </div>
        <button
          onClick={() => setModal({ mode: "add" })}
          className="flex items-center gap-2 px-5 py-2.5
            bg-gradient-to-r from-violet-600 to-purple-600
            text-white rounded-xl font-semibold text-sm
            shadow-md hover:shadow-lg hover:from-violet-700 hover:to-purple-700 transition"
        >
          <Plus className="w-4 h-4" />
          إضافة كورس
        </button>
      </div>

      {/* Cards grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {courses.map((course) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden
                hover:shadow-md transition-shadow"
            >
              {/* Thumbnail */}
              {course.image ? (
                <img
                  src={course.image}
                  alt={course.title_ar}
                  className="w-full h-44 object-cover"
                />
              ) : (
                <div
                  className="w-full h-44 bg-gradient-to-br from-violet-100 to-purple-200
                  flex items-center justify-center"
                >
                  <BookOpen className="w-12 h-12 text-violet-400" />
                </div>
              )}

              {/* Info */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2 gap-2">
                  <h3 className="font-bold text-gray-800 leading-tight">
                    {course.title_ar || course.title || "بدون عنوان"}
                  </h3>
                  <span
                    className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium
                    ${
                      course.available
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {course.available ? "متاح" : "مخفي"}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                  <span>{course.category || "—"}</span>
                  <span>·</span>
                  <Clock className="w-3 h-3" />
                  <span>{course.duration || "—"}</span>
                  {course.totalLessons ? (
                    <>
                      <span>·</span>
                      <span>{course.totalLessons} درس</span>
                    </>
                  ) : null}
                </div>

                <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                  {course.description_ar || course.description || "لا يوجد وصف"}
                </p>

                {/* playlist indicator */}
                <div
                  className={`flex items-center gap-1.5 text-xs mb-4 px-2.5 py-1.5 rounded-lg w-fit
                  ${
                    course.playlistUrl
                      ? "bg-violet-50 text-violet-700"
                      : "bg-gray-50 text-gray-400"
                  }`}
                >
                  <Link className="w-3 h-3" />
                  {course.playlistUrl
                    ? "رابط المحتوى مضاف ✓"
                    : "لم يُضَف رابط المحتوى"}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-violet-600">
                    {course.price ? `${course.price} جنيه` : "مجاني"}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEdit(course)}
                      className="p-2 bg-violet-50 text-violet-600 rounded-lg
                        hover:bg-violet-100 transition"
                      title="تعديل"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleting(course._id)}
                      className="p-2 bg-red-50 text-red-500 rounded-lg
                        hover:bg-red-100 transition"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {courses.length === 0 && !loading && (
            <div className="col-span-full text-center py-20 text-gray-400">
              <BookOpen className="w-14 h-14 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">لا توجد كورسات بعد</p>
              <p className="text-sm mt-1">اضغط "إضافة كورس" لإنشاء أول كورس</p>
            </div>
          )}
        </div>
      )}

      {/* ── Add / Edit Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setModal(null)}
            />
            {/* sheet */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 24 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl
                max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div
                className="sticky top-0 bg-white px-6 py-5 border-b border-gray-100
                flex items-center justify-between z-10 rounded-t-3xl"
              >
                <h2 className="text-xl font-bold text-gray-800">
                  {modal.mode === "add" ? "إضافة كورس جديد" : "تعديل الكورس"}
                </h2>
                <button
                  onClick={() => setModal(null)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Form */}
              <div className="p-6">
                <CourseForm
                  initial={
                    modal.course ? editInitial(modal.course) : EMPTY_FORM
                  }
                  onSubmit={modal.mode === "add" ? handleAdd : handleEdit}
                  onClose={() => setModal(null)}
                  loading={loading}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirm Modal ─────────────────────────────────────────── */}
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
              <div
                className="w-14 h-14 bg-red-100 rounded-full flex items-center
                justify-center mx-auto mb-4"
              >
                <Trash2 className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-1">
                حذف الكورس
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                هل أنت متأكد؟ سيتم حذف الكورس ورابط المحتوى نهائياً ولا يمكن
                التراجع.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleting(null)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl
                    text-gray-600 hover:bg-gray-50 transition text-sm"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl
                    hover:bg-red-600 transition text-sm font-semibold disabled:opacity-60"
                >
                  {loading ? "جارٍ الحذف..." : "حذف"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCourses;
