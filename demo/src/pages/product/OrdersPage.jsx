/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ProductContext } from "../../context/ProductContext";
import { AppContext } from "../../context/AppContext";
import { motion } from "framer-motion";
import {
  Package,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  RefreshCw,
  Eye,
  Download,
} from "lucide-react";

const OrdersPage = () => {
  const navigate = useNavigate();
  const { orders, getUserOrders, getOrderDetails, formatPrice } =
    useContext(ProductContext);
  const { token } = useContext(AppContext);

  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (token) {
      loadOrders();
    }
  }, [token]);

  const loadOrders = async () => {
    setLoading(true);
    await getUserOrders();
    setLoading(false);
  };

  const handleViewOrder = async (orderId) => {
    const order = await getOrderDetails(orderId);
    setSelectedOrder(order);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <CheckCircle size={20} />;
      case "processing":
        return <RefreshCw size={20} />;
      case "shipped":
        return <Truck size={20} />;
      case "cancelled":
        return <XCircle size={20} />;
      default:
        return <Clock size={20} />;
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">طلباتي</h1>
          <p className="text-textSoft">تتبع ومراجعة جميع طلباتك</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center bg-white rounded-2xl shadow-lg p-12">
            <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-textMain mb-2">
              لا توجد طلبات
            </h3>
            <p className="text-textSoft mb-8">ابدأ بالتسوق لعرض الطلبات هنا</p>
            <button
              onClick={() => navigate("/products")}
              className="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-secondary transition-colors text-lg"
            >
              تصفح المنتجات
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-xl text-primary">
                          الطلب #{order.orderNumber}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 ${getStatusColor(
                            order.orderStatus
                          )}`}
                        >
                          {getStatusIcon(order.orderStatus)}
                          {getStatusText(order.orderStatus)}
                        </span>
                      </div>
                      <p className="text-textSoft">
                        {new Date(order.createdAt).toLocaleDateString("ar-EG", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-2xl text-primary">
                        {formatPrice(order.total)}
                      </p>
                      <p className="text-sm text-textSoft">
                        {order.items?.length || 0} منتج
                      </p>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="mb-6">
                    <div className="flex gap-4 overflow-x-auto pb-4">
                      {order.items?.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name_ar}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        </div>
                      ))}
                      {order.items?.length > 3 && (
                        <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-500 font-bold">
                            +{order.items.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-6 border-t border-borderLight">
                    <button
                      onClick={() => handleViewOrder(order._id)}
                      className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-secondary transition-colors flex items-center gap-2"
                    >
                      <Eye size={20} />
                      عرض التفاصيل
                    </button>

                    {order.orderStatus === "delivered" && (
                      <button className="px-6 py-3 border border-borderLight rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <Download size={20} />
                        تحميل الفاتورة
                      </button>
                    )}

                    <button className="px-6 py-3 border border-borderLight rounded-xl hover:bg-gray-50 transition-colors">
                      تتبع الطلب
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
