const express = require("express");
const authAdmin = require("../middlewares/authAdmin.js");
const {
  adminGetAllProducts,
  adminGetProductDetails,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminUpdateProductStatus,
} = require("../controllers/productController.js");

const {
  adminGetAllOrders,
  adminGetOrderDetails,
  adminUpdateOrderStatus,
  adminUpdateOrderShipping,
  adminExportOrders,
} = require("../controllers/orderController.js");

const {
  adminGetAllCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} = require("../controllers/categoryController.js");

const router = express.Router();

// ============================
// PRODUCT ADMIN ROUTES
// ============================

// Get all products (admin view)
router.get("/", authAdmin, adminGetAllProducts);

// Get product details (admin view)
router.get("/:productId", authAdmin, adminGetProductDetails);

// Create new product
router.post("/create", authAdmin, adminCreateProduct);

// Update product
router.put("/:productId", authAdmin, adminUpdateProduct);

// Delete product
router.delete("/:productId", authAdmin, adminDeleteProduct);

// Update product status
router.put("/:productId/status", authAdmin, adminUpdateProductStatus);

// ============================
// ORDER ADMIN ROUTES
// ============================

// Get all orders (admin view)
router.get("/orders", authAdmin, adminGetAllOrders);

// Get order details (admin view)
router.get("/orders/:orderId", authAdmin, adminGetOrderDetails);

// Update order status
router.put("/orders/:orderId/status", authAdmin, adminUpdateOrderStatus);

// Update order shipping details
router.put("/orders/:orderId/shipping", authAdmin, adminUpdateOrderShipping);

// Export orders
router.get("/orders/export", authAdmin, adminExportOrders);

// ============================
// CATEGORY ADMIN ROUTES
// ============================

// Get all categories
router.get("/categories", authAdmin, adminGetAllCategories);

// Create category
router.post("/categories/create", authAdmin, adminCreateCategory);

// Update category
router.put("/categories/:categoryId", authAdmin, adminUpdateCategory);

// Delete category
router.delete("/categories/:categoryId", authAdmin, adminDeleteCategory);

module.exports = router;
