// In your productRoute.js or create a new categoryRoute.js
const express = require("express");
const authAdmin = require("../middlewares/authAdmin.js");
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryProducts,
} = require("../controllers/categoryController.js");

const router = express.Router();

// Admin routes
router.get("/categories", authAdmin, getCategories);
router.post("/categories/create", authAdmin, createCategory);
router.put("/categories/:categoryId", authAdmin, updateCategory);
router.delete("/categories/:categoryId", authAdmin, deleteCategory);

module.exports = router;
