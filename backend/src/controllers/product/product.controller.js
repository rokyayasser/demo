// controllers/product/product.controller.js
const BaseController = require("../BaseController");
const Product = require("../../models/Product");
const cloudinary = require("../../config/cloudinary");

// ─── Safe number parser ───────────────────────────────────────────────────────
// Returns undefined (not null, not NaN) when value is blank/null/invalid.
const safeNumber = (val) => {
  if (val === "" || val === "null" || val === "undefined" || val == null)
    return undefined;
  const n = Number(val);
  return isNaN(n) ? undefined : n;
};

class ProductController extends BaseController {
  constructor() {
    super();
    [
      "getAllProducts",
      "getAllProductsAdmin",
      "getProductById",
      "createProduct",
      "updateProduct",
      "deleteProduct",
    ].forEach((m) => (this[m] = this[m].bind(this)));
  }

  // ── Public: only available products ─────────────────────────────────────────
  async getAllProducts(req, res) {
    try {
      const { category, page = 1, limit = 20, search } = req.query;

      // Users only see available products
      const query = { available: true };
      if (category) query.category = category;
      if (search)
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { title_ar: { $regex: search, $options: "i" } },
        ];

      const skip = (Number(page) - 1) * Number(limit);
      const [products, total] = await Promise.all([
        Product.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit)),
        Product.countDocuments(query),
      ]);

      return this.success(res, { products, total });
    } catch (err) {
      return this.error(res, err.message);
    }
  }

  async getProductById(req, res) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) return this.notFound(res, "المنتج غير موجود");
      if (!product.available)
        return this.notFound(res, "هذا المنتج غير متاح حالياً");

      // Increment view counter safely (flat field, no nested meta)
      await Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

      return this.success(res, { product });
    } catch (err) {
      return this.error(res, err.message);
    }
  }

  // ── Admin: all products regardless of available ───────────────────────────
  async getAllProductsAdmin(req, res) {
    try {
      const { page = 1, limit = 50, search, category } = req.query;
      const query = {};
      if (category) query.category = category;
      if (search)
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { title_ar: { $regex: search, $options: "i" } },
        ];

      const skip = (Number(page) - 1) * Number(limit);
      const [products, total] = await Promise.all([
        Product.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit)),
        Product.countDocuments(query),
      ]);

      return this.success(res, { products, total });
    } catch (err) {
      return this.error(res, err.message);
    }
  }

  async createProduct(req, res) {
    try {
      const body = req.body;

      let imageUrl = "";
      if (req.file) {
        const result = await cloudinary.uploadImage(
          req.file.buffer,
          "products",
        );
        imageUrl = result.secure_url;
      }

      const discountPrice = safeNumber(body.discountPrice);

      const product = new Product({
        title: body.title || "",
        title_ar: body.title_ar || "",
        description: body.description || "",
        description_ar: body.description_ar || "",
        category: body.category || "",
        price: safeNumber(body.price) ?? 0,
        // Only set discountPrice if it was actually provided and is a valid number
        ...(discountPrice !== undefined && { discountPrice }),
        stock: safeNumber(body.stock) ?? 0,
        available: body.available !== "false" && body.available !== false,
        featured: body.featured === "true" || body.featured === true,
        image: imageUrl,
        tags: body.tags
          ? body.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      });

      await product.save();
      return this.success(res, { product }, "تم إنشاء المنتج بنجاح");
    } catch (err) {
      console.error("createProduct:", err.message);
      return this.error(res, err.message);
    }
  }

  async updateProduct(req, res) {
    try {
      const body = req.body;
      const updates = {};

      if (body.title !== undefined) updates.title = body.title;
      if (body.title_ar !== undefined) updates.title_ar = body.title_ar;
      if (body.description !== undefined)
        updates.description = body.description;
      if (body.description_ar !== undefined)
        updates.description_ar = body.description_ar;
      if (body.category !== undefined) updates.category = body.category;

      if (body.price !== undefined) updates.price = safeNumber(body.price) ?? 0;
      if (body.stock !== undefined) updates.stock = safeNumber(body.stock) ?? 0;

      // discountPrice: only set if a real number was sent, otherwise $unset it
      if (body.discountPrice !== undefined) {
        const dp = safeNumber(body.discountPrice);
        if (dp !== undefined) {
          updates.discountPrice = dp;
        } else {
          updates.$unset = { discountPrice: "" };
        }
      }

      if (body.available !== undefined) {
        updates.available =
          body.available !== "false" && body.available !== false;
      }
      if (body.featured !== undefined) {
        updates.featured = body.featured === "true" || body.featured === true;
      }
      if (body.tags !== undefined) {
        updates.tags = body.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      }

      if (req.file) {
        const result = await cloudinary.uploadImage(
          req.file.buffer,
          "products",
        );
        updates.image = result.secure_url;
      }

      // Separate $unset from the main update to avoid operator conflicts
      const unsetOps = updates.$unset;
      delete updates.$unset;

      const updateOp = { $set: updates };
      if (unsetOps) updateOp.$unset = unsetOps;

      const product = await Product.findByIdAndUpdate(req.params.id, updateOp, {
        new: true,
        runValidators: true,
      });
      if (!product) return this.notFound(res, "المنتج غير موجود");

      return this.success(res, { product }, "تم تحديث المنتج");
    } catch (err) {
      console.error("updateProduct:", err.message);
      return this.error(res, err.message);
    }
  }

  async deleteProduct(req, res) {
    try {
      await Product.findByIdAndDelete(req.params.id);
      return this.success(res, null, "تم حذف المنتج");
    } catch (err) {
      return this.error(res, err.message);
    }
  }
}

module.exports = new ProductController();
