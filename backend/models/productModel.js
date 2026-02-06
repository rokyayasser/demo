const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  review: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    name_ar: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    description_ar: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    category_ar: {
      type: String,
      required: true,
    },
    subcategory: {
      type: String,
    },
    subcategory_ar: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    discountPrice: {
      type: Number,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    mainImage: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    sku: {
      type: String,
      unique: true,
      required: true,
    },
    brand: {
      type: String,
    },
    brand_ar: {
      type: String,
    },
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    tags: [String],
    isPublished: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    ratings: [reviewSchema],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    soldCount: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Virtual for discount percentage
productSchema.virtual("discountPercentage").get(function () {
  if (this.discountPrice && this.price) {
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  return 0;
});

// Indexes for better query performance
productSchema.index({ category: 1, isPublished: 1 });
productSchema.index({ isFeatured: 1, isPublished: 1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ createdAt: -1 });

const productModel = mongoose.model("product", productSchema);

module.exports = productModel;
