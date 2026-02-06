const productModel = require("../models/productModel.js");
const cartModel = require("../models/cartModel.js");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");

// Admin: Create new product
const createProduct = async (req, res) => {
  try {
    console.log("=== CREATING NEW PRODUCT ===");
    console.log("Request Body:", req.body);
    console.log("Files received:", req.files);

    const {
      name,
      name_ar,
      description,
      description_ar,
      category,
      category_ar,
      subcategory,
      subcategory_ar,
      price,
      discountPrice,
      stock,
      sku,
      brand,
      brand_ar,
      tags,
      specifications,
      isPublished,
      isFeatured,
    } = req.body;

    // Check for required fields
    if (!name || !name_ar || !category || !category_ar || !price || !sku) {
      return res.json({
        success: false,
        message: "الرجاء إدخال جميع الحقول المطلوبة",
      });
    }

    // Check if SKU already exists
    const existingProduct = await productModel.findOne({ sku });
    if (existingProduct) {
      return res.json({
        success: false,
        message: "رقم SKU مسجل مسبقاً",
      });
    }

    // Handle image uploads
    let images = [];
    let mainImage = "";

    if (!req.files || !req.files.images || req.files.images.length === 0) {
      return res.json({
        success: false,
        message: "يجب رفع صورة واحدة على الأقل للمنتج",
      });
    }

    // Upload all images to Cloudinary
    console.log("Uploading product images to Cloudinary...");
    const imageFiles = req.files.images;

    for (let i = 0; i < imageFiles.length; i++) {
      const imageFile = imageFiles[i];

      try {
        const imageUpload = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "products",
              resource_type: "image",
              transformation: [
                { width: 800, height: 800, crop: "fill" },
                { quality: "auto" },
              ],
            },
            (error, result) => {
              if (error) {
                console.error("Cloudinary upload error:", error);
                reject(error);
              } else {
                console.log(`✅ Image ${i + 1} uploaded`);
                resolve(result);
              }
            }
          );

          uploadStream.end(imageFile.buffer);
        });

        images.push(imageUpload.secure_url);

        // First image is main image
        if (i === 0) {
          mainImage = imageUpload.secure_url;
        }
      } catch (uploadError) {
        console.error(`❌ Error uploading image ${i + 1}:`, uploadError);
        return res.json({
          success: false,
          message: `فشل في رفع الصورة ${i + 1}: ${uploadError.message}`,
        });
      }
    }

    // Parse specifications if provided
    let parsedSpecifications = {};
    if (specifications) {
      try {
        parsedSpecifications = JSON.parse(specifications);
      } catch (e) {
        console.warn("Could not parse specifications:", e.message);
      }
    }

    // Parse tags
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = JSON.parse(tags);
      } catch (e) {
        parsedTags = tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag);
      }
    }

    // Create product object
    const productData = {
      name: name.trim(),
      name_ar: name_ar.trim(),
      description: description.trim(),
      description_ar: description_ar.trim(),
      category: category.trim(),
      category_ar: category_ar.trim(),
      subcategory: subcategory ? subcategory.trim() : "",
      subcategory_ar: subcategory_ar ? subcategory_ar.trim() : "",
      price: parseFloat(price) || 0,
      discountPrice: discountPrice ? parseFloat(discountPrice) : null,
      stock: parseInt(stock) || 0,
      sku: sku.trim(),
      brand: brand ? brand.trim() : "",
      brand_ar: brand_ar ? brand_ar.trim() : "",
      images,
      mainImage,
      specifications: parsedSpecifications,
      tags: parsedTags,
      isPublished: isPublished === "true" || isPublished === true,
      isFeatured: isFeatured === "true" || isFeatured === true,
    };

    console.log("Product data to save:", {
      name: productData.name,
      name_ar: productData.name_ar,
      price: productData.price,
      stock: productData.stock,
      sku: productData.sku,
      imagesCount: productData.images.length,
    });

    const newProduct = new productModel(productData);
    await newProduct.save();

    console.log("✅ Product created successfully");
    console.log("Product ID:", newProduct._id);

    res.json({
      success: true,
      message: "تم إنشاء المنتج بنجاح",
      product: {
        _id: newProduct._id,
        name: newProduct.name,
        name_ar: newProduct.name_ar,
        mainImage: newProduct.mainImage,
        price: newProduct.price,
        category: newProduct.category,
      },
    });
  } catch (error) {
    console.error("❌ Error creating product:", error);
    console.error("Error stack:", error.stack);

    res.status(500).json({
      success: false,
      message: "حدث خطأ في إنشاء المنتج: " + error.message,
      error:
        process.env.NODE_ENV === "development" ? error.toString() : undefined,
    });
  }
};

// Admin: Update product
const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const updateData = req.body;
    const imageFiles = req.files?.images;

    console.log(`=== UPDATING PRODUCT: ${productId} ===`);

    const product = await productModel.findById(productId);
    if (!product) {
      return res.json({
        success: false,
        message: "المنتج غير موجود",
      });
    }

    // Handle new images if provided
    if (imageFiles && imageFiles.length > 0) {
      const newImages = [];

      // Upload new images
      for (let i = 0; i < imageFiles.length; i++) {
        const imageFile = imageFiles[i];

        const imageUpload = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "products",
              resource_type: "image",
              transformation: [
                { width: 800, height: 800, crop: "fill" },
                { quality: "auto" },
              ],
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );

          uploadStream.end(imageFile.buffer);
        });

        newImages.push(imageUpload.secure_url);
      }

      // If we have new images, replace old ones
      if (newImages.length > 0) {
        // Delete old images from Cloudinary (optional - can keep for CDN cache)
        updateData.images = newImages;
        updateData.mainImage = newImages[0];
      }
    }

    // Parse specifications if provided
    if (updateData.specifications) {
      try {
        updateData.specifications = JSON.parse(updateData.specifications);
      } catch (e) {
        // Keep as is if parsing fails
      }
    }

    // Parse tags if provided
    if (updateData.tags) {
      try {
        updateData.tags = JSON.parse(updateData.tags);
      } catch (e) {
        updateData.tags = updateData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag);
      }
    }

    // Convert numeric values
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.discountPrice) {
      updateData.discountPrice = updateData.discountPrice
        ? parseFloat(updateData.discountPrice)
        : null;
    }
    if (updateData.stock) updateData.stock = parseInt(updateData.stock);

    // Update product
    Object.assign(product, updateData);
    product.updatedAt = new Date();
    await product.save();

    console.log("✅ Product updated successfully");

    res.json({
      success: true,
      message: "تم تحديث المنتج بنجاح",
      product,
    });
  } catch (error) {
    console.error("❌ Error updating product:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin: Delete product
const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    console.log(`=== DELETING PRODUCT: ${productId} ===`);

    const product = await productModel.findById(productId);
    if (!product) {
      return res.json({
        success: false,
        message: "المنتج غير موجود",
      });
    }

    // Delete images from Cloudinary
    try {
      for (const imageUrl of product.images) {
        const publicId = imageUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`products/${publicId}`);
      }
      console.log("✅ Deleted product images from Cloudinary");
    } catch (cloudinaryError) {
      console.warn(
        "Could not delete images from Cloudinary:",
        cloudinaryError.message
      );
    }

    await productModel.findByIdAndDelete(productId);

    console.log("✅ Product deleted successfully");

    res.json({
      success: true,
      message: "تم حذف المنتج بنجاح",
    });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all products (public)
const getAllProducts = async (req, res) => {
  try {
    const {
      category,
      subcategory,
      minPrice,
      maxPrice,
      sortBy = "createdAt",
      sortOrder = "desc",
      search,
      page = 1,
      limit = 20,
      featured,
      inStock,
    } = req.query;

    const query = { isPublished: true };
    const skip = (page - 1) * limit;

    // Apply filters
    if (category) {
      query.category = category;
    }

    if (subcategory) {
      query.subcategory = subcategory;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (featured === "true") {
      query.isFeatured = true;
    }

    if (inStock === "true") {
      query.stock = { $gt: 0 };
    } else if (inStock === "false") {
      query.stock = 0;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { name_ar: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { description_ar: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Sort options
    const sortOptions = {};
    if (sortBy === "price") {
      sortOptions.price = sortOrder === "asc" ? 1 : -1;
    } else if (sortBy === "rating") {
      sortOptions.averageRating = sortOrder === "asc" ? 1 : -1;
    } else if (sortBy === "popular") {
      sortOptions.soldCount = sortOrder === "asc" ? 1 : -1;
    } else {
      sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;
    }

    // Get total count and data
    const totalCount = await productModel.countDocuments(query);
    const products = await productModel
      .find(query)
      .select(
        "name name_ar mainImage price discountPrice averageRating stock isFeatured createdAt"
      )
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get categories for filters
    const categories = await productModel.distinct("category", {
      isPublished: true,
    });

    console.log(`✅ Retrieved ${products.length} products`);

    res.json({
      success: true,
      products,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
      categories,
      filters: {
        minPrice: await productModel
          .findOne({ isPublished: true })
          .sort({ price: 1 })
          .select("price"),
        maxPrice: await productModel
          .findOne({ isPublished: true })
          .sort({ price: -1 })
          .select("price"),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get product details
const getProductDetails = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.userId;

    console.log(`=== GETTING PRODUCT DETAILS: ${productId} ===`);

    const product = await productModel.findById(productId);
    if (!product || !product.isPublished) {
      return res.json({
        success: false,
        message: "المنتج غير موجود",
      });
    }

    // Increase views
    product.views = (product.views || 0) + 1;
    await product.save();

    // Check if product is in user's cart
    let inCart = false;
    let cartQuantity = 0;

    if (userId) {
      const cart = await cartModel.findOne({ userId });
      if (cart) {
        const cartItem = cart.items.find(
          (item) => item.productId.toString() === productId
        );
        if (cartItem) {
          inCart = true;
          cartQuantity = cartItem.quantity;
        }
      }
    }

    // Get related products
    const relatedProducts = await productModel
      .find({
        _id: { $ne: productId },
        category: product.category,
        isPublished: true,
      })
      .select("name name_ar mainImage price discountPrice averageRating")
      .limit(4);

    res.json({
      success: true,
      product: {
        ...product.toObject(),
        inCart,
        cartQuantity,
      },
      relatedProducts,
    });
  } catch (error) {
    console.error("❌ Error fetching product details:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get featured products
const getFeaturedProducts = async (req, res) => {
  try {
    const featuredProducts = await productModel
      .find({ isPublished: true, isFeatured: true })
      .select("name name_ar mainImage price discountPrice averageRating")
      .limit(8);

    res.json({
      success: true,
      products: featuredProducts,
    });
  } catch (error) {
    console.error("❌ Error fetching featured products:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get categories
const getCategories = async (req, res) => {
  try {
    const categories = await productModel.aggregate([
      { $match: { isPublished: true } },
      {
        $group: {
          _id: "$category",
          category_ar: { $first: "$category_ar" },
          count: { $sum: 1 },
          image: { $first: "$mainImage" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Admin: Get all products

// Admin: Get product details
const adminGetProductDetails = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await productModel.findById(productId);
    if (!product) {
      return res.json({
        success: false,
        message: "المنتج غير موجود",
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("❌ Error fetching product details for admin:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin: Update product status (publish/unpublish, featured)
const adminUpdateProductStatus = async (req, res) => {
  try {
    const { productId } = req.params;
    const { isPublished, isFeatured } = req.body;

    const product = await productModel.findById(productId);
    if (!product) {
      return res.json({
        success: false,
        message: "المنتج غير موجود",
      });
    }

    if (isPublished !== undefined) {
      product.isPublished = isPublished;
    }

    if (isFeatured !== undefined) {
      product.isFeatured = isFeatured;
    }

    await product.save();

    res.json({
      success: true,
      message: "تم تحديث حالة المنتج بنجاح",
      product,
    });
  } catch (error) {
    console.error("❌ Error updating product status:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin: Get all products (for admin panel)
const adminGetAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { name_ar: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }

    const totalCount = await productModel.countDocuments(query);
    const products = await productModel
      .find(query)
      .select(
        "name name_ar mainImage price discountPrice stock isPublished isFeatured createdAt"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      products,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
      stats: {
        total: await productModel.countDocuments(),
        published: await productModel.countDocuments({ isPublished: true }),
        outOfStock: await productModel.countDocuments({ stock: 0 }),
        featured: await productModel.countDocuments({ isFeatured: true }),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching products for admin:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductDetails,
  getFeaturedProducts,
  getCategories,
  adminGetAllProducts,
  adminGetProductDetails,
  adminUpdateProductStatus,
};
