const express = require("express");
const authUser = require("../middlewares/authUser.js");
const authAdmin = require("../middlewares/authAdmin.js");

const {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductDetails,
  getFeaturedProducts,
  getCategories,
  adminGetAllProducts,
} = require("../controllers/productController.js");

const {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../controllers/cartController.js");

const {
  createOrder,
  getUserOrders,
  getOrderDetails,
  handleOrderPaymentCallback,
  cancelOrder,
} = require("../controllers/orderController.js");

const { upload, checkUploadErrors } = require("../middlewares/multer.js");

const router = express.Router();

// ========================================
// PUBLIC ROUTES (No Auth)
// ========================================

// Get all products (with filters)
router.get("/", getAllProducts);

// Get product details
router.get("/:productId", getProductDetails);

// Get featured products
router.get("/featured/all", getFeaturedProducts);

// Get categories
router.get("/categories/all", getCategories);

// Order payment callback (from Paymob)
router.post("/payment/callback", handleOrderPaymentCallback);

// ========================================
// USER ROUTES (Require Auth)
// ========================================

// Cart routes
router.post("/cart/add", authUser, addToCart);
router.get("/cart", authUser, getCart);
router.put("/cart/item/:itemId", authUser, updateCartItem);
router.delete("/cart/item/:itemId", authUser, removeCartItem);
router.delete("/cart/clear", authUser, clearCart);

// Order routes
router.post("/order/create", authUser, createOrder);
router.get("/orders/my-orders", authUser, getUserOrders);
router.get("/order/:orderId", authUser, getOrderDetails);
router.post("/order/cancel/:orderId", authUser, cancelOrder);

// ========================================
// ADMIN ROUTES (Require Admin Auth)
// ========================================

// Create new product
router.post(
  "/admin/create",
  authAdmin,
  upload.fields([{ name: "images", maxCount: 10 }]),
  checkUploadErrors,
  createProduct
);

// Update product
router.put(
  "/admin/:productId",
  authAdmin,
  upload.fields([{ name: "images", maxCount: 10 }]),
  checkUploadErrors,
  updateProduct
);

// Delete product
router.delete("/admin/:productId", authAdmin, deleteProduct);

// Get all products (admin view)
router.get("/admin/all", authAdmin, adminGetAllProducts);

module.exports = router;
