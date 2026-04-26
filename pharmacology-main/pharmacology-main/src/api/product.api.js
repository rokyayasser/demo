import api from "./axios.config";

export const productApi = {
  // Get all products
  getAllProducts: async (filters = {}) => {
    try {
      const response = await api.get("/api/v1/products", { params: filters });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "فشل في تحميل المنتجات",
      };
    }
  },

  // Get product by ID
  getProductById: async (productId) => {
    try {
      const response = await api.get(`/api/v1/products/${productId}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "فشل في تحميل المنتج",
      };
    }
  },

  // Get featured products
  getFeaturedProducts: async () => {
    try {
      const response = await api.get("/api/v1/products/featured/all");
      return response.data;
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "فشل في تحميل المنتجات المميزة",
        products: [],
      };
    }
  },

  // Get categories
  getCategories: async () => {
    try {
      const response = await api.get("/api/v1/products/categories/all");
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "فشل في تحميل الفئات",
        categories: [],
      };
    }
  },

  // Cart operations (all protected)
  getCart: async () => {
    try {
      const response = await api.get("/api/v1/products/cart");
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "فشل في تحميل السلة",
        cart: null,
      };
    }
  },

  addToCart: async (
    productId,
    quantity = 1,
    selectedSize = null,
    selectedColor = null,
  ) => {
    try {
      const response = await api.post("/api/v1/products/cart/add", {
        productId,
        quantity,
        selectedSize,
        selectedColor,
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "فشل في إضافة المنتج",
      };
    }
  },

  updateCartItem: async (itemId, quantity) => {
    try {
      const response = await api.put(`/api/v1/products/cart/item/${itemId}`, {
        quantity,
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "فشل في تحديث الكمية",
      };
    }
  },

  removeCartItem: async (itemId) => {
    try {
      const response = await api.delete(`/api/v1/products/cart/item/${itemId}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "فشل في إزالة المنتج",
      };
    }
  },

  clearCart: async () => {
    try {
      const response = await api.delete("/api/v1/products/cart/clear");
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "فشل في تفريغ السلة",
      };
    }
  },

  // Orders (protected)
  createOrder: async (orderData) => {
    try {
      const response = await api.post(
        "/api/v1/products/order/create",
        orderData,
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "فشل إنشاء الطلب",
      };
    }
  },

  getUserOrders: async () => {
    try {
      const response = await api.get("/api/v1/products/orders/my-orders");
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "فشل في تحميل الطلبات",
        orders: [],
      };
    }
  },

  getOrderById: async (orderId) => {
    try {
      const response = await api.get(`/api/v1/products/order/${orderId}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "فشل في تحميل تفاصيل الطلب",
        order: null,
      };
    }
  },
};
