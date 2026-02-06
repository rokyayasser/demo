const categoryModel = require("../models/categoryModel.js");
const productModel = require("../models/productModel.js");

// Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await categoryModel
      .find()
      .populate("parentCategory", "name_ar");

    // Get product count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await productModel.countDocuments({
          category: category.name,
          isPublished: true,
        });

        return {
          ...category.toObject(),
          productCount,
        };
      })
    );

    res.json({
      success: true,
      categories: categoriesWithCount,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create category
const createCategory = async (req, res) => {
  try {
    const {
      name,
      name_ar,
      description,
      description_ar,
      image,
      isActive,
      parentCategory,
    } = req.body;

    // Check if category already exists
    const existingCategory = await categoryModel.findOne({ name });
    if (existingCategory) {
      return res.json({
        success: false,
        message: "التصنيف موجود مسبقاً",
      });
    }

    const category = new categoryModel({
      name,
      name_ar,
      description,
      description_ar,
      image,
      isActive: isActive !== false,
      parentCategory: parentCategory || null,
    });

    await category.save();

    res.json({
      success: true,
      message: "تم إنشاء التصنيف بنجاح",
      category,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const updateData = req.body;

    const category = await categoryModel.findById(categoryId);
    if (!category) {
      return res.json({
        success: false,
        message: "التصنيف غير موجود",
      });
    }

    // Check if name is being changed and if new name exists
    if (updateData.name && updateData.name !== category.name) {
      const existingCategory = await categoryModel.findOne({
        name: updateData.name,
        _id: { $ne: categoryId },
      });
      if (existingCategory) {
        return res.json({
          success: false,
          message: "اسم التصنيف موجود مسبقاً",
        });
      }
    }

    Object.assign(category, updateData);
    await category.save();

    res.json({
      success: true,
      message: "تم تحديث التصنيف بنجاح",
      category,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Check if category has products
    const category = await categoryModel.findById(categoryId);
    if (!category) {
      return res.json({
        success: false,
        message: "التصنيف غير موجود",
      });
    }

    const productCount = await productModel.countDocuments({
      category: category.name,
    });

    if (productCount > 0) {
      return res.json({
        success: false,
        message: "لا يمكن حذف التصنيف لأنه يحتوي على منتجات",
      });
    }

    // Check if category has subcategories
    const subcategories = await categoryModel.countDocuments({
      parentCategory: categoryId,
    });

    if (subcategories > 0) {
      return res.json({
        success: false,
        message: "لا يمكن حذف التصنيف لأنه يحتوي على تصنيفات فرعية",
      });
    }

    await categoryModel.findByIdAndDelete(categoryId);

    res.json({
      success: true,
      message: "تم حذف التصنيف بنجاح",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
