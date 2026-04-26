/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, User, Mail, Phone, Calendar } from "lucide-react";
import { AdminContext } from "../../context/AdminContext";

const AdminUsers = () => {
  const { users, getUsers, loading } = useContext(AdminContext);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getUsers();
  }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.phone || "").includes(q)
    );
  });

  return (
    <div className="space-y-6" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-gray-800">المستخدمون</h1>
        <p className="text-gray-500 text-sm">{users.length} مستخدم مسجل</p>
      </motion.div>

      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="بحث بالاسم أو البريد..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <User className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>لا يوجد مستخدمون مطابقون</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    {[
                      "المستخدم",
                      "البريد الإلكتروني",
                      "الهاتف",
                      "الجنس",
                      "تاريخ التسجيل",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-right px-6 py-4 font-semibold"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.image ? (
                            <img
                              src={user.image}
                              className="w-9 h-9 rounded-full object-cover"
                              alt={user.name}
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center">
                              <span className="text-violet-600 font-bold text-sm">
                                {user.name?.[0]}
                              </span>
                            </div>
                          )}
                          <span className="font-semibold text-gray-800">
                            {user.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {user.phone || "—"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {user.gender || "—"}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString("ar-EG")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default AdminUsers;
