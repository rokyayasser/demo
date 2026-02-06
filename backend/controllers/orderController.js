const orderModel = require("../models/orderModel.js");
const cartModel = require("../models/cartModel.js");
const productModel = require("../models/productModel.js");
const userModel = require("../models/userModel.js");
const { initiatePayment } = require("../src/config/paymob.js");
const mongoose = require("mongoose");

// Create order from cart
const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, notes } = req.body;
    const userId = req.userId;

    console.log(`=== CREATING ORDER: User ${userId} ===`);

    if (!userId) {
      return res.json({
        success: false,
        message: "يجب تسجيل الدخول أولاً",
      });
    }

    // Get user cart
    const cart = await cartModel.findOne({ userId }).populate({
      path: "items.productId",
      select: "name name_ar mainImage price discountPrice stock",
    });

    if (!cart || cart.items.length === 0) {
      return res.json({
        success: false,
        message: "السلة فارغة",
      });
    }

    // Validate stock and prepare order items
    const orderItems = [];
    let subtotal = 0;

    for (const cartItem of cart.items) {
      const product = cartItem.productId;

      // Check stock
      if (product.stock < cartItem.quantity) {
        return res.json({
          success: false,
          message: `الكمية غير متوفرة للمنتج: ${product.name_ar}. المتوفر: ${product.stock}`,
        });
      }

      const price = product.discountPrice || product.price;
      const itemTotal = price * cartItem.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product._id,
        name: product.name,
        name_ar: product.name_ar,
        image: product.mainImage,
        quantity: cartItem.quantity,
        price,
        total: itemTotal,
        selectedSize: cartItem.selectedSize,
        selectedColor: cartItem.selectedColor,
      });

      // Reduce product stock
      product.stock -= cartItem.quantity;
      product.soldCount += cartItem.quantity;
      await product.save();
    }

    // Calculate shipping (example: 30 EGP for orders under 500 EGP)
    const shippingCost = subtotal >= 500 ? 0 : 30;

    // Calculate tax (example: 14%)
    const tax = subtotal * 0.14;

    const total = subtotal + shippingCost + tax;

    // Create order
    const order = new orderModel({
      userId,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || "paymob",
      subtotal,
      shippingCost,
      tax,
      total,
      notes,
    });

    await order.save();

    // Clear user's cart
    cart.items = [];
    await cart.save();

    console.log(`✅ Order created: ${order.orderNumber}`);

    // If payment method is paymob, initiate payment
    if (paymentMethod === "paymob") {
      const user = await userModel.findById(userId);
      const userInfo = {
        name: user.name || "عميل",
        email: user.email || "customer@example.com",
        phone: user.phone || "01000000000",
      };

      const paymentData = await initiatePayment(
        order._id.toString(),
        total,
        userInfo
      );

      // Update order with Paymob info
      order.paymobOrderId = paymentData.orderId;
      order.paymobMerchantOrderId = paymentData.merchantOrderId;
      await order.save();

      console.log("✅ Payment initiated for order");

      return res.json({
        success: true,
        message: "تم إنشاء الطلب بنجاح",
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          total: order.total,
          paymentStatus: order.paymentStatus,
        },
        paymentUrl: paymentData.iframeUrl,
      });
    }

    res.json({
      success: true,
      message: "تم إنشاء الطلب بنجاح",
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        total: order.total,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
      },
    });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get user orders
const getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    console.log(`=== GETTING USER ORDERS: User ${userId} ===`);

    if (!userId) {
      return res.json({
        success: false,
        message: "يجب تسجيل الدخول أولاً",
      });
    }

    const totalCount = await orderModel.countDocuments({ userId });
    const orders = await orderModel
      .find({ userId })
      .select(
        "orderNumber items shippingAddress total paymentStatus orderStatus createdAt"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      orders,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
      stats: {
        totalOrders: totalCount,
        pending: await orderModel.countDocuments({
          userId,
          orderStatus: "pending",
        }),
        delivered: await orderModel.countDocuments({
          userId,
          orderStatus: "delivered",
        }),
      },
    });
  } catch (error) {
    console.error("❌ Error getting user orders:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get order details
const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    console.log(`=== GETTING ORDER DETAILS: ${orderId} ===`);

    if (!userId) {
      return res.json({
        success: false,
        message: "يجب تسجيل الدخول أولاً",
      });
    }

    const order = await orderModel.findOne({ _id: orderId, userId }).populate({
      path: "items.productId",
      select: "name name_ar description_ar",
    });

    if (!order) {
      return res.json({
        success: false,
        message: "الطلب غير موجود",
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("❌ Error getting order details:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Order payment callback (from Paymob)
const handleOrderPaymentCallback = async (req, res) => {
  try {
    console.log("=== ORDER PAYMENT CALLBACK RECEIVED ===");
    console.log("Body:", JSON.stringify(req.body, null, 2));

    const callbackData = req.body.obj || req.body || req.query;

    if (!callbackData || Object.keys(callbackData).length === 0) {
      console.error("❌ No callback data");
      return res.json({ success: true, message: "No data" });
    }

    // Extract merchant order ID
    const merchantOrderId =
      callbackData.order?.merchant_order_id ||
      callbackData.merchant_order_id ||
      callbackData.obj?.order?.merchant_order_id;

    if (!merchantOrderId) {
      console.error("❌ No merchant_order_id");
      return res.json({ success: true, message: "No merchant ID" });
    }

    const orderId = merchantOrderId.split("_")[0];
    console.log("Order ID:", orderId);

    // Determine success
    const success =
      callbackData.success === true ||
      callbackData.success === "true" ||
      callbackData.is_successful === true ||
      callbackData.obj?.success === true ||
      callbackData.txn_response_code === "APPROVED" ||
      callbackData.obj?.txn_response_code === "APPROVED";

    console.log("Payment Success:", success);

    // Find order
    const order = await orderModel.findById(orderId);
    if (!order) {
      console.error("❌ Order not found");
      return res.json({ success: true, message: "Order not found" });
    }

    console.log("✅ Order found:", order.orderNumber);

    if (success) {
      console.log("💰 PAYMENT SUCCESSFUL - Updating order");

      // Update order
      order.paymentStatus = "paid";
      order.paymobTransactionId =
        callbackData.id || callbackData.transaction_id;
      order.orderStatus = "processing";
      order.metadata = callbackData;
      await order.save();

      console.log("✅ Order payment confirmed");

      // Here you can send order confirmation email, etc.

      return res.json({
        success: true,
        message: "Payment processed successfully",
        paymentStatus: "paid",
        orderId: order._id,
        orderNumber: order.orderNumber,
      });
    } else {
      // PAYMENT FAILED
      console.log("❌ PAYMENT FAILED");

      order.paymentStatus = "failed";
      order.metadata = callbackData;
      await order.save();

      console.log("✅ Order marked as payment failed");

      // Restore product stock
      for (const item of order.items) {
        await productModel.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity, soldCount: -item.quantity },
        });
      }

      return res.json({
        success: true,
        message: "Payment failed",
        paymentStatus: "failed",
      });
    }
  } catch (error) {
    console.error("❌ Callback Error:", error);
    console.error("Stack:", error.stack);

    // Always return success to Paymob
    return res.json({
      success: true,
      message: "Callback error",
      error: error.message,
    });
  }
};

// Cancel order
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    console.log(`=== CANCELLING ORDER: ${orderId} ===`);

    if (!userId) {
      return res.json({
        success: false,
        message: "يجب تسجيل الدخول أولاً",
      });
    }

    const order = await orderModel.findOne({ _id: orderId, userId });
    if (!order) {
      return res.json({
        success: false,
        message: "الطلب غير موجود",
      });
    }

    // Only allow cancellation if order is still pending or processing
    if (!["pending", "processing"].includes(order.orderStatus)) {
      return res.json({
        success: false,
        message: "لا يمكن إلغاء الطلب في هذه المرحلة",
      });
    }

    // Restore product stock
    for (const item of order.items) {
      await productModel.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity, soldCount: -item.quantity },
      });
    }

    // Update order status
    order.orderStatus = "cancelled";
    if (order.paymentStatus === "paid") {
      order.paymentStatus = "refunded";
    }
    await order.save();

    console.log("✅ Order cancelled");

    res.json({
      success: true,
      message: "تم إلغاء الطلب بنجاح",
    });
  } catch (error) {
    console.error("❌ Error cancelling order:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderDetails,
  handleOrderPaymentCallback,
  cancelOrder,
};
