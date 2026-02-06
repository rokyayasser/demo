const cartModel = require("../models/cartModel.js");
const productModel = require("../models/productModel.js");
const mongoose = require("mongoose");

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, size, color } = req.body;
    const userId = req.userId;

    console.log(`=== ADDING TO CART: Product ${productId}, User ${userId} ===`);

    if (!userId) {
      return res.json({
        success: false,
        message: "يجب تسجيل الدخول أولاً",
      });
    }

    // Get product
    const product = await productModel.findById(productId);
    if (!product || !product.isPublished) {
      return res.json({
        success: false,
        message: "المنتج غير متاح",
      });
    }

    // Check stock
    if (product.stock < quantity) {
      return res.json({
        success: false,
        message: `الكمية المطلوبة غير متوفرة. المتوفر: ${product.stock}`,
      });
    }

    const price = product.discountPrice || product.price;

    // Find or create cart
    let cart = await cartModel.findOne({ userId });
    if (!cart) {
      cart = new cartModel({ userId, items: [] });
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.selectedSize === size &&
        item.selectedColor === color
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;

      if (product.stock < newQuantity) {
        return res.json({
          success: false,
          message: `الكمية الإجمالية غير متوفرة. المتوفر: ${product.stock}`,
        });
      }

      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].price = price;
    } else {
      // Add new item
      cart.items.push({
        productId,
        quantity,
        price,
        selectedSize: size,
        selectedColor: color,
      });
    }

    await cart.save();

    console.log("✅ Item added to cart");

    res.json({
      success: true,
      message: "تمت إضافة المنتج إلى السلة",
      cart: {
        totalItems: cart.totalItems,
        subtotal: cart.subtotal,
        total: cart.total,
      },
    });
  } catch (error) {
    console.error("❌ Error adding to cart:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get user's cart
const getCart = async (req, res) => {
  try {
    const userId = req.userId;

    console.log(`=== GETTING CART: User ${userId} ===`);

    let cart = await cartModel.findOne({ userId }).populate({
      path: "items.productId",
      select: "name name_ar mainImage price discountPrice stock",
    });

    if (!cart) {
      cart = new cartModel({ userId, items: [] });
      await cart.save();
    }

    // Calculate fresh totals
    let subtotal = 0;
    const itemsWithDetails = await Promise.all(
      cart.items.map(async (item) => {
        const product = item.productId;
        const price = product.discountPrice || product.price;
        const itemTotal = price * item.quantity;
        subtotal += itemTotal;

        return {
          ...item.toObject(),
          product: {
            _id: product._id,
            name: product.name,
            name_ar: product.name_ar,
            mainImage: product.mainImage,
            price: product.price,
            discountPrice: product.discountPrice,
            stock: product.stock,
          },
          price,
          itemTotal,
        };
      })
    );

    // Update cart totals
    cart.subtotal = subtotal;
    cart.total = subtotal + cart.shipping + cart.tax;
    await cart.save();

    res.json({
      success: true,
      cart: {
        items: itemsWithDetails,
        totalItems: cart.totalItems,
        subtotal: cart.subtotal,
        shipping: cart.shipping,
        tax: cart.tax,
        total: cart.total,
      },
    });
  } catch (error) {
    console.error("❌ Error getting cart:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.userId;

    console.log(`=== UPDATING CART ITEM: ${itemId} ===`);

    if (!userId) {
      return res.json({
        success: false,
        message: "يجب تسجيل الدخول أولاً",
      });
    }

    if (!quantity || quantity < 1) {
      return res.json({
        success: false,
        message: "الكمية يجب أن تكون 1 على الأقل",
      });
    }

    const cart = await cartModel.findOne({ userId });
    if (!cart) {
      return res.json({
        success: false,
        message: "السلة فارغة",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );
    if (itemIndex === -1) {
      return res.json({
        success: false,
        message: "العنصر غير موجود في السلة",
      });
    }

    // Get product to check stock
    const product = await productModel.findById(
      cart.items[itemIndex].productId
    );
    if (product.stock < quantity) {
      return res.json({
        success: false,
        message: `الكمية المطلوبة غير متوفرة. المتوفر: ${product.stock}`,
      });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    console.log("✅ Cart item updated");

    res.json({
      success: true,
      message: "تم تحديث الكمية",
      cart: {
        totalItems: cart.totalItems,
        subtotal: cart.subtotal,
        total: cart.total,
      },
    });
  } catch (error) {
    console.error("❌ Error updating cart item:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Remove item from cart
const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.userId;

    console.log(`=== REMOVING CART ITEM: ${itemId} ===`);

    if (!userId) {
      return res.json({
        success: false,
        message: "يجب تسجيل الدخول أولاً",
      });
    }

    const cart = await cartModel.findOne({ userId });
    if (!cart) {
      return res.json({
        success: false,
        message: "السلة فارغة",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );
    if (itemIndex === -1) {
      return res.json({
        success: false,
        message: "العنصر غير موجود في السلة",
      });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    console.log("✅ Item removed from cart");

    res.json({
      success: true,
      message: "تم إزالة المنتج من السلة",
      cart: {
        totalItems: cart.totalItems,
        subtotal: cart.subtotal,
        total: cart.total,
      },
    });
  } catch (error) {
    console.error("❌ Error removing cart item:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    const userId = req.userId;

    console.log(`=== CLEARING CART: User ${userId} ===`);

    if (!userId) {
      return res.json({
        success: false,
        message: "يجب تسجيل الدخول أولاً",
      });
    }

    const cart = await cartModel.findOne({ userId });
    if (!cart) {
      return res.json({
        success: false,
        message: "السلة فارغة بالفعل",
      });
    }

    cart.items = [];
    await cart.save();

    console.log("✅ Cart cleared");

    res.json({
      success: true,
      message: "تم تفريغ السلة",
    });
  } catch (error) {
    console.error("❌ Error clearing cart:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
