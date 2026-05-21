// pages/Admin/AdminBlogs.jsx
import React, { useState, useEffect, useRef, useContext } from "react";
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
  Youtube,
} from "lucide-react";
import { AdminContext } from "../../context/AdminContext";
import api from "../../services/api.config";
import { toast } from "react-toastify";

const CATEGORIES = ["تغذية علاجية", "مقال طبي", "أمراض مزمنة", "صحة عامة"];
const EMPTY = {
  title: "",
  content: "",
  image: "",
  category: "صحة عامة",
  youtubeId: "",
  meta1: "",
  meta2: "5 دقائق قراءة",
  published: true,
};

// ── Blog Form ─────────────────────────────────────────────────────────────────
const BlogForm = ({ initial = EMPTY, onSubmit, onClose, loading }) => {
  const [form, setForm] = useState({ ...EMPTY, ...initial });
  const [imageFile, setImage] = useState(null);
  const [preview, setPreview] = useState(initial.image || null);
  const fileRef = useRef();

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleImage = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImage(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = () => {
    if (!form.title.trim()) {
      toast.error("العنوان مطلوب");
      return;
    }
    if (!form.content.trim()) {
      toast.error("المحتوى مطلوب");
      return;
    }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      // Skip the image text field if a file was selected — avoid sending both
      if (k === "image" && imageFile) return;
      fd.append(k, String(v));
    });
    // Append file last — this becomes the single image source
    if (imageFile) fd.append("image", imageFile);
    onSubmit(fd);
  };

  const cls =
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
            <p className="text-sm text-gray-400">صورة المقال</p>
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
      {/* Or image URL */}
      <input
        type="text"
        value={form.image}
        onChange={set("image")}
        placeholder="أو الصق رابط صورة مباشرة..."
        className={cls}
      />

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          العنوان *
        </label>
        <input
          type="text"
          value={form.title}
          onChange={set("title")}
          placeholder="عنوان المقال"
          className={cls}
        />
      </div>

      {/* Category + meta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            التصنيف
          </label>
          <select
            value={form.category}
            onChange={set("category")}
            className={cls}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            تاريخ النشر
          </label>
          <input
            type="text"
            value={form.meta1}
            onChange={set("meta1")}
            placeholder="3 يناير 2025"
            className={cls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            وقت القراءة
          </label>
          <input
            type="text"
            value={form.meta2}
            onChange={set("meta2")}
            placeholder="5 دقائق قراءة"
            className={cls}
          />
        </div>
      </div>

      {/* YouTube */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
          <Youtube className="w-4 h-4 text-red-500" /> YouTube Video ID
          (اختياري)
        </label>
        <input
          type="text"
          value={form.youtubeId}
          onChange={set("youtubeId")}
          placeholder="مثال: j0QmNMTKYCk"
          className={cls}
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          المحتوى *
        </label>
        <textarea
          value={form.content}
          onChange={set("content")}
          rows={12}
          className={`${cls} resize-none`}
          placeholder="اكتب محتوى المقال هنا..."
        />
      </div>

      {/* Published toggle */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">منشور</span>
        <button
          type="button"
          onClick={() => setForm((p) => ({ ...p, published: !p.published }))}
          className={`relative w-12 h-6 rounded-full transition-colors ${form.published ? "bg-primary" : "bg-gray-300"}`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
            ${form.published ? "translate-x-6" : "translate-x-0.5"}`}
          />
        </button>
        <span
          className={`text-xs font-medium ${form.published ? "text-green-600" : "text-gray-400"}`}
        >
          {form.published ? "مرئي للمستخدمين" : "مخفي"}
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
            "حفظ المقال"
          )}
        </button>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const AdminBlogs = () => {
  const { aToken } = useContext(AdminContext);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null); // null | {mode, blog?}
  const [deleting, setDeleting] = useState(null);

  const authH = { headers: { token: aToken } };

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/v1/blogs?limit=100", authH);
      if (data.success) setBlogs(data.data?.blogs || []);
    } catch (e) {
      toast.error("فشل تحميل المقالات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (fd) => {
    setSaving(true);
    try {
      const { data } = await api.post("/api/v1/blogs", fd, {
        headers: { token: aToken },
      });
      if (data.success) {
        toast.success("تم إنشاء المقال");
        setModal(null);
        load();
      } else toast.error(data.message);
    } catch (e) {
      toast.error(e.response?.data?.message || "حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (fd) => {
    setSaving(true);
    try {
      const { data } = await api.put(`/api/v1/blogs/${modal.blog._id}`, fd, {
        headers: { token: aToken },
      });
      if (data.success) {
        toast.success("تم التحديث");
        setModal(null);
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
      await api.delete(`/api/v1/blogs/${deleting}`, authH);
      toast.success("تم الحذف");
      setDeleting(null);
      load();
    } catch (e) {
      toast.error("فشل الحذف");
    }
  };

  const togglePublish = async (blog) => {
    try {
      const fd = new FormData();
      fd.append("published", String(!blog.published));
      await api.put(`/api/v1/blogs/${blog._id}`, fd, {
        headers: { token: aToken },
      });
      setBlogs((p) =>
        p.map((b) =>
          b._id === blog._id ? { ...b, published: !b.published } : b,
        ),
      );
    } catch (e) {
      toast.error("فشل التحديث");
    }
  };

  const editInitial = (b) => ({
    title: b.title || "",
    content: b.content || "",
    image: b.image || "",
    category: b.category || "صحة عامة",
    youtubeId: b.youtubeId || "",
    meta1: b.meta1 || "",
    meta2: b.meta2 || "5 دقائق قراءة",
    published: b.published !== false,
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة المقالات</h1>
          <p className="text-gray-500 text-sm">{blogs.length} مقال</p>
        </div>
        <button
          onClick={() => setModal({ mode: "add" })}
          className="flex items-center gap-2 px-5 py-2.5
            bg-gradient-to-r from-primary to-secondary text-white rounded-xl
            font-semibold text-sm shadow-md hover:shadow-lg transition"
        >
          <Plus className="w-4 h-4" /> إضافة مقال
        </button>
      </div>

      {/* Cards */}
      {loading && !blogs.length ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {blogs.map((blog, i) => (
              <motion.div
                key={blog._id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: i * 0.03 }}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow
                  ${!blog.published ? "border-red-100 opacity-80" : "border-gray-100"}`}
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
                  {blog.image ? (
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">
                      📝
                    </div>
                  )}
                  {!blog.published && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-red-500 text-white text-sm font-bold px-4 py-1.5 rounded-full">
                        مخفي
                      </span>
                    </div>
                  )}
                  <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                    {blog.category}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-1 line-clamp-2 text-sm leading-snug">
                    {blog.title}
                  </h3>
                  <p className="text-xs text-gray-400 mb-4">
                    {blog.meta1} · {blog.meta2}
                  </p>

                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => togglePublish(blog)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition
                        ${
                          blog.published
                            ? "bg-green-50 text-green-700 hover:bg-green-100"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                      {blog.published ? (
                        <>
                          <Eye className="w-3.5 h-3.5" /> منشور
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" /> مخفي
                        </>
                      )}
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setModal({ mode: "edit", blog })}
                        className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleting(blog._id)}
                        className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {blogs.length === 0 && !loading && (
            <div className="col-span-full text-center py-20 text-gray-400">
              <CheckCircle className="w-14 h-14 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">لا توجد مقالات بعد</p>
              <p className="text-sm mt-1">اضغط "إضافة مقال" لإنشاء أول مقال</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
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
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white px-6 py-5 border-b border-gray-100 flex items-center justify-between z-10 rounded-t-3xl">
                <h2 className="text-xl font-bold text-gray-800">
                  {modal.mode === "add" ? "إضافة مقال جديد" : "تعديل المقال"}
                </h2>
                <button
                  onClick={() => setModal(null)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6">
                <BlogForm
                  initial={modal.blog ? editInitial(modal.blog) : EMPTY}
                  onSubmit={modal.mode === "add" ? handleAdd : handleEdit}
                  onClose={() => setModal(null)}
                  loading={saving}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
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
                حذف المقال
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
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 text-sm font-semibold"
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

export default AdminBlogs;
