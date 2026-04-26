const mongoose = require("mongoose");

// ─── Cart Item ────────────────────────────────────────────────────────────────
const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  price: { type: Number, required: true },
  selectedSize: { type: String, default: null },
  selectedColor: { type: String, default: null },
});

// ─── Cart ─────────────────────────────────────────────────────────────────────
const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true,
      index: true,
    },
    items: [cartItemSchema],
    subtotal: { type: Number, default: 0 },
    totalItems: { type: Number, default: 0 },

    // TTL: MongoDB will auto-delete the document 120 seconds after `expiresAt`
    // Every time items change we reset this field to now + 2 min
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 2 * 60 * 1000), // 2 minutes from now
      index: { expireAfterSeconds: 0 }, // TTL index — expire exactly at `expiresAt`
    },
  },
  { timestamps: true },
);

// ─── Helper: recalculate totals + reset TTL ──────────────────────────────────
cartSchema.methods.recalculate = function () {
  this.totalItems = this.items.reduce((sum, i) => sum + i.quantity, 0);
  this.subtotal = this.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  // Reset the 2-minute expiry window on every modification
  this.expiresAt = new Date(Date.now() + 2 * 60 * 1000);
};

// ─── Helper: extend TTL without changing items (e.g. user is browsing) ───────
cartSchema.methods.extendTTL = function () {
  this.expiresAt = new Date(Date.now() + 2 * 60 * 1000);
};

const Cart = mongoose.models.cart || mongoose.model("cart", cartSchema);
module.exports = Cart;
