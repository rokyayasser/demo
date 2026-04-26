/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, Eye, Check, X, Filter } from "lucide-react";
import { AdminContext } from "../../context/AdminContext";

const STATUS_AR = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  completed: "مكتمل",
  cancelled: "ملغي",
  no_show: "لم يحضر",
};
const STATUS_CLS = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100  text-green-800",
  completed: "bg-blue-100   text-blue-800",
  cancelled: "bg-red-100    text-red-800",
  no_show: "bg-gray-100   text-gray-700",
};

const AllAppointments = () => {
  const { appointments, getAppointments, updateAppointmentStatus, loading } =
    useContext(AdminContext);
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    getAppointments();
  }, []);

  const filtered = appointments.filter((a) => {
    const name = (
      a.name || `${a.firstName || ""} ${a.lastName || ""}`
    ).toLowerCase();
    const matchSearch =
      name.includes(search.toLowerCase()) ||
      (a.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.phone || "").includes(search);
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    const matchDate = !dateFilter || a.date === dateFilter;
    return matchSearch && matchStatus && matchDate;
  });

  return (
    <div className="space-y-6" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-gray-800">جميع المواعيد</h1>
        <p className="text-gray-500 text-sm">
          {appointments.length} موعد إجمالاً
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3"
      >
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="بحث بالاسم أو الهاتف..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
        >
          <option value="all">كل الحالات</option>
          {Object.entries(STATUS_AR).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
        {(search || statusFilter !== "all" || dateFilter) && (
          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
              setDateFilter("");
            }}
            className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm hover:bg-gray-200 transition"
          >
            مسح
          </button>
        )}
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            لا توجد مواعيد مطابقة
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  {[
                    "المريض",
                    "الخدمة",
                    "التاريخ",
                    "الوقت",
                    "الحالة",
                    "الإجراءات",
                  ].map((h) => (
                    <th key={h} className="text-right px-6 py-4 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((apt) => (
                  <tr
                    key={apt._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">
                        {apt.name ||
                          `${apt.firstName || ""} ${apt.lastName || ""}`}
                      </p>
                      <p className="text-xs text-gray-400">{apt.email}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {apt.service?.title_ar || apt.category || "—"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{apt.date}</td>
                    <td className="px-6 py-4 text-gray-600">{apt.time}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_CLS[apt.status] || "bg-gray-100 text-gray-600"}`}
                      >
                        {STATUS_AR[apt.status] || apt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            navigate(`/admin/appointments/${apt._id}`)
                          }
                          className="p-1.5 bg-violet-50 text-violet-600 rounded-lg hover:bg-violet-100 transition"
                          title="عرض"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {apt.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                updateAppointmentStatus(apt._id, "confirmed")
                              }
                              className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition"
                              title="تأكيد"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                updateAppointmentStatus(apt._id, "cancelled")
                              }
                              className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                              title="إلغاء"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {apt.status === "confirmed" && (
                          <button
                            onClick={() =>
                              updateAppointmentStatus(apt._id, "completed")
                            }
                            className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                            title="إكمال"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AllAppointments;
