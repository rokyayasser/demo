/* eslint-disable no-unused-vars */
import React, { useContext, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { AdminContext } from "../../context/AdminContext";

const ServicesList = () => {
  const {
    services,
    getServices,
    deleteService,
    toggleServiceAvailability,
    loading,
  } = useContext(AdminContext);

  const navigate = useNavigate();

  useEffect(() => {
    getServices();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه الخدمة؟")) return;
    await deleteService(id);
  };

  const handleToggle = async (id) => {
    await toggleServiceAvailability(id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          الخدمات الطبية
        </h1>
        <p className="text-gray-500 text-sm">{services.length} خدمة</p>
      </div>

      {services.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <EyeOff className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-bold text-gray-700 mb-2">
            لا توجد خدمات
          </h3>
          <p className="text-gray-500 mb-6">ابدأ بإضافة أول خدمة طبية</p>
          <button
            onClick={() => navigate("/admin/add-service")}
            className="px-6 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold hover:from-secondary hover:to-primary transition"
          >
            إضافة خدمة
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {services.map((service, index) => (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.04 }}
                className={`bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${
                  !service.available
                    ? "border-red-100 opacity-75"
                    : "border-gray-100"
                }`}
              >
                {/* Image */}
                <div className="relative h-44 bg-gray-100 overflow-hidden">
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.title_ar || service.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <span className="text-4xl">🩺</span>
                    </div>
                  )}

                  {/* Unavailable badge */}
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
                  <h3 className="text-lg font-bold text-gray-800 mb-1 truncate">
                    {service.title_ar || service.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-1">
                    {service.category_ar || service.category}
                  </p>
                  <p className="text-primary font-bold text-xl mb-4">
                    {service.fees?.toLocaleString()} جنيه
                  </p>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2">
                    {/* Toggle availability */}
                    <button
                      onClick={() => handleToggle(service._id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                        service.available
                          ? "bg-green-50 text-green-700 hover:bg-green-100"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      title={
                        service.available ? "إخفاء الخدمة" : "إظهار الخدمة"
                      }
                    >
                      {service.available ? (
                        <>
                          <Eye className="w-4 h-4" />
                          <span>متاح</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-4 h-4" />
                          <span>مخفي</span>
                        </>
                      )}
                    </button>

                    <div className="flex gap-2">
                      {/* Edit */}
                      <button
                        onClick={() =>
                          navigate(`/admin/edit-service/${service._id}`)
                        }
                        className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                        title="تعديل"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(service._id)}
                        className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
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
        </div>
      )}
    </motion.div>
  );
};

export default ServicesList;
