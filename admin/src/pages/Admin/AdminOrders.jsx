/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from "react";
import { AdminContext } from "../../context/AdminContext";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Truck,
  Package,
  Download,
  MoreVertical,
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

const AdminOrders = () => {
  const { aToken, backendUrl } = useContext(AdminContext);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: "",
    search: "",
  });

  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/admin/orders`, {
        headers: { token: aToken },
        params: filters,
      });

      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("فشل في تحميل الطلبات");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/admin/orders/${orderId}/status`,
        { status },
        { headers: { token: aToken } }
      );

      if (data.success) {
        toast.success("✅ تم تحديث حالة الطلب");
        fetchOrders();
      }
    } catch (error) {
      toast.error("فشل في تحديث حالة الطلب");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "shipped":
        return "bg-purple-100 text-purple-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "قيد الانتظار";
      case "processing":
        return "قيد التجهيز";
      case "shipped":
        return "تم الشحن";
      case "delivered":
        return "تم التسليم";
      case "cancelled":
        return "ملغى";
      default:
        return status;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-7xl mx-auto p-4 sm:p-6"
      dir="rtl"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">إدارة الطلبات</h1>
        <p className="text-textSoft">إدارة وتتبع طلبات المتجر</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textSoft">إجمالي الطلبات</p>
              <p className="text-2xl font-bold mt-2">1,248</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Package className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textSoft">طلبات جديدة</p>
              <p className="text-2xl font-bold mt-2">48</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Package className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textSoft">قيد التجهيز</p>
              <p className="text-2xl font-bold mt-2">32</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <Truck className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textSoft">تم التسليم</p>
              <p className="text-2xl font-bold mt-2">1,150</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-textSoft"
                size={20}
              />
              <input
                type="text"
                placeholder="ابحث برقم الطلب أو اسم العميل..."
                className="w-full pr-10 pl-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                dir="rtl"
              />
            </div>
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-3 border border-borderLight rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">جميع الحالات</option>
            <option value="pending">قيد الانتظار</option>
            <option value="processing">قيد التجهيز</option>
            <option value="shipped">تم الشحن</option>
            <option value="delivered">تم التسليم</option>
            <option value="cancelled">ملغى</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-borderLight">
                <th className="py-4 px-6 text-right font-bold text-textMain">
                  رقم الطلب
                </th>
                <th className="py-4 px-6 text-right font-bold text-textMain">
                  العميل
                </th>
                <th className="py-4 px-6 text-right font-bold text-textMain">
                  المبلغ
                </th>
                <th className="py-4 px-6 text-right font-bold text-textMain">
                  الحالة
                </th>
                <th className="py-4 px-6 text-right font-bold text-textMain">
                  التاريخ
                </th>
                <th className="py-4 px-6 text-right font-bold text-textMain">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b border-borderLight hover:bg-gray-50"
                >
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-bold text-primary">
                        #{order.orderNumber}
                      </p>
                      <p className="text-sm text-textSoft">
                        {order.items?.length || 0} منتج
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium">
                        {order.shippingAddress?.fullName}
                      </p>
                      <p className="text-sm text-textSoft">
                        {order.shippingAddress?.phone}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-bold">
                      EGP {order.total?.toLocaleString()}
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                        order.orderStatus
                      )}`}
                    >
                      {getStatusText(order.orderStatus)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <p>
                      {new Date(order.createdAt).toLocaleDateString("ar-EG")}
                    </p>
                    <p className="text-sm text-textSoft">
                      {new Date(order.createdAt).toLocaleTimeString("ar-EG")}
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        title="عرض التفاصيل"
                      >
                        <Eye size={16} />
                      </button>
                      <div className="relative">
                        <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminOrders;
