/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, ShoppingBag, Image } from "lucide-react";
import { AdminContext } from "../../context/AdminContext";

const EMPTY = {
  title: "",
  title_ar: "",
  description: "",
  description_ar: "",
  category: "",
  price: "",
  discountPrice: "",
  stock: "",
  available: true,
};

const ProductForm = ({ initial = EMPTY, onSubmit, onClose, loading }) => {
  const [form, setForm] = useState(initial);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(initial.image || null);
  const fileRef = useRef();

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = () => {
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("title_ar", form.title_ar);
    fd.append("description", form.description);
    fd.append("description_ar", form.description_ar);
    fd.append("category", form.category);
    fd.append("price", form.price);
    fd.append("stock", form.stock || "0");
    fd.append("available", String(form.available));
    // Only send discountPrice if the user typed an actual number
    const dp = String(form.discountPrice || "").trim();
    if (dp !== "" && dp !== "0") fd.append("discountPrice", dp);
    if (image) fd.append("image", image);
    onSubmit(fd);
  };

  const field = (label, key, type = "text", placeholder = "") => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={set(key)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
      />
    </div>
  );

  return (
    <div className="space-y-5" dir="rtl">
      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-gray-200 rounded-2xl h-40 flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 transition overflow-hidden relative"
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
            <p className="text-sm text-gray-400">اختر صورة المنتج</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {field("اسم المنتج (عربي)", "title_ar", "text", "اسم المنتج")}
        {field("اسم المنتج (إنجليزي)", "title", "text", "Product name")}
        {field("الفئة", "category", "text", "مكملات / أدوية...")}
        {field("السعر (جنيه)", "price", "number")}
        {field("السعر بعد الخصم", "discountPrice", "number")}
        {field("الكمية المتاحة", "stock", "number")}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          الوصف
        </label>
        <textarea
          value={form.description_ar}
          onChange={set("description_ar")}
          rows={3}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">متاح للبيع</label>
        <button
          onClick={() => setForm((p) => ({ ...p, available: !p.available }))}
          className={`relative w-12 h-6 rounded-full transition-colors ${form.available ? "bg-amber-500" : "bg-gray-300"}`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.available ? "translate-x-0.5" : "translate-x-6"}`}
          />
        </button>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={onClose}
          className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition"
        >
          إلغاء
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl text-sm font-semibold disabled:opacity-60 transition"
        >
          {loading ? "جارٍ الحفظ..." : "حفظ"}
        </button>
      </div>
    </div>
  );
};

const AdminProducts = () => {
  const {
    products,
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    loading,
  } = useContext(AdminContext);
  const [modal, setModal] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    getProducts();
  }, []);

  const handleAdd = async (fd) => {
    if (await addProduct(fd)) setModal(null);
  };
  const handleEdit = async (fd) => {
    if (await updateProduct(modal.product._id, fd)) setModal(null);
  };
  const handleDelete = async (id) => {
    await deleteProduct(id);
    setDeleting(null);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">المنتجات</h1>
          <p className="text-gray-500 text-sm">{products.length} منتج</p>
        </div>
        <button
          onClick={() => setModal({ mode: "add" })}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition"
        >
          <Plus className="w-4 h-4" /> إضافة منتج
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {products.map((product) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              {product.image && (
                <img
                  src={product.image}
                  alt={product.title_ar}
                  className="w-full h-44 object-cover"
                />
              )}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-gray-800">
                      {product.title_ar || product.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {product.category}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${product.available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                  >
                    {product.available ? "متاح" : "مخفي"}
                  </span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                  {product.description_ar}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    {product.discountPrice ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-amber-600">
                          {product.discountPrice} جنيه
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          {product.price}
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-amber-600">
                        {product.price} جنيه
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setModal({ mode: "edit", product })}
                      className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleting(product._id)}
                      className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {products.length === 0 && (
            <div className="col-span-full text-center py-20 text-gray-400">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>لا توجد منتجات</p>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white px-6 py-5 border-b border-gray-100 flex items-center justify-between z-10">
                <h2 className="text-xl font-bold text-gray-800">
                  {modal.mode === "add" ? "إضافة منتج" : "تعديل المنتج"}
                </h2>
                <button
                  onClick={() => setModal(null)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <ProductForm
                  initial={
                    modal.product ? { ...EMPTY, ...modal.product } : EMPTY
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
              <h3 className="font-bold text-gray-800 mb-1">حذف المنتج</h3>
              <p className="text-gray-500 text-sm mb-5">هل أنت متأكد؟</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleting(null)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => handleDelete(deleting)}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600"
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

export default AdminProducts;
