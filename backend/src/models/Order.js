const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
  name_ar: String,
  image: String,
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  selectedSize: String,
  selectedColor: String,
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    orderNumber: { type: String, unique: true },
    items: [orderItemSchema],

    // Pricing
    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 30 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },

    // Status
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["card", "cash", "wallet"],
      default: "card",
    },

    // Shipping
    shippingAddress: {
      line1: String,
      line2: String,
      city: String,
      country: String,
      postalCode: String,
    },

    // Payment gateway
    paymobOrderId: { type: String, index: true },
    paymobMerchantOrderId: { type: String },
    paymobTransactionId: { type: String },
    paymentDate: Date,

    couponCode: String,
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

// Auto-generate order number before first save
orderSchema.pre("save", async function (next) {
  if (!this.isNew) return next();
  const count = await mongoose.model("order").countDocuments();
  this.orderNumber = `ORD-${Date.now()}-${String(count + 1).padStart(4, "0")}`;
  next();
});

const Order = mongoose.models.order || mongoose.model("order", orderSchema);
module.exports = Order;
