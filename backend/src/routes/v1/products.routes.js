// routes/v1/products.routes.js
"use strict";
const express = require("express");
const router = express.Router();
const c = require("../../controllers/product/product.controller");
const authAdmin = require("../../middlewares/auth/admin.auth");
const { upload } = require("../../middlewares/upload/multer.config");

let paymob;
try {
  paymob = require("../../config/paymob");
} catch (e) {
  console.warn("paymob not loaded");
}

let sendOrderConfirmationEmail;
try {
  ({ sendOrderConfirmationEmail } = require("../../services/email.service"));
} catch (e) {}

// Static path — prevents "cart" matching /:id
router.get("/cart", (req, res) =>
  res.json({ success: true, data: { items: [], total: 0 } }),
);

// ── Checkout callback (webhook — before auth) ──────────────────────────────
router.post("/checkout/callback", async (req, res) => {
  try {
    const callbackData = req.body.obj || req.body;
    const receivedHmac = req.query.hmac;

    if (paymob?.verifyCallback && receivedHmac) {
      if (!paymob.verifyCallback(callbackData, receivedHmac))
        return res.status(200).json({ success: false });
    }

    const success =
      callbackData.success === true || callbackData.success === "true";
    if (!success) return res.status(200).json({ success: false });

    const billing = callbackData.order?.shipping_data || {};
    const email = billing.email || callbackData.billing_data?.email;
    const name =
      `${billing.first_name || ""} ${billing.last_name || ""}`.trim() ||
      "Customer";
    const merchantId = callbackData.order?.merchant_order_id;
    const amount = (callbackData.amount_cents || 0) / 100;

    console.log(`✅ Order paid: ${merchantId} — ${email} — ${amount} EGP`);

    if (sendOrderConfirmationEmail && email) {
      sendOrderConfirmationEmail({
        toEmail: email,
        userName: name,
        orderId: merchantId,
        amount,
        items: callbackData.order?.items || [],
      }).catch(console.error);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("checkout/callback:", err.message);
    return res.status(200).json({ success: false });
  }
});

// ── Guest checkout — no auth required ─────────────────────────────────────
router.post("/checkout", async (req, res) => {
  try {
    const { cart, total, customerInfo } = req.body;

    if (!cart?.length)
      return res.status(400).json({ success: false, message: "السلة فارغة" });
    if (!customerInfo?.email || !customerInfo?.name || !customerInfo?.phone)
      return res
        .status(400)
        .json({ success: false, message: "الاسم والبريد والهاتف مطلوبة" });

    const amount = Number(total) || 0;
    const merchantOrderId = `order-${Date.now()}`;
    const items = cart.map((i) => ({
      name: i.title || "منتج",
      amount_cents: Math.round((Number(i.price) || 0) * 100),
      description: i.title || "",
      quantity: Number(i.quantity) || 1,
    }));

    const userInfo = {
      name: customerInfo.name,
      email: customerInfo.email,
      phone: (customerInfo.phone || "01000000000").replace(/\s+/g, ""),
    };

    if (paymob && typeof paymob.initiatePayment === "function") {
      const paymobData = await paymob.initiatePayment(
        merchantOrderId,
        amount,
        userInfo,
        items,
      );
      const paymentUrl = paymobData?.paymentUrl || paymobData?.iframeUrl;
      return res.json({
        success: true,
        data: {
          paymentUrl,
          iframeUrl: paymobData?.iframeUrl,
          orderId: paymobData?.orderId,
          merchantOrderId: paymobData?.merchantOrderId || merchantOrderId,
          amount,
        },
      });
    }

    return res.json({
      success: true,
      data: {
        merchantOrderId,
        amount,
        message: "سيتم التواصل معك لتأكيد الطلب",
      },
    });
  } catch (err) {
    console.error("checkout:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ── Public ─────────────────────────────────────────────────────────────────
router.get("/", c.getAllProducts);
router.get("/:id", c.getProductById);

// ── Admin ──────────────────────────────────────────────────────────────────
router.get("/admin/all", authAdmin, c.getAllProductsAdmin);
router.post("/", authAdmin, upload.single("image"), c.createProduct);
router.put("/:id", authAdmin, upload.single("image"), c.updateProduct);
router.delete("/:id", authAdmin, c.deleteProduct);

module.exports = router;
