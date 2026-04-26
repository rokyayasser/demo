// src/config/paymob.js  — REPLACE existing file
const axios = require("axios");

class PaymobService {
  constructor() {
    this.config = {
      apiKey: process.env.PAYMOB_API_KEY,
      integrationId: process.env.PAYMOB_INTEGRATION_ID,
      iframeId: process.env.PAYMOB_IFRAME_ID,
      hmacSecret: process.env.PAYMOB_HMAC_SECRET,
    };
    this.baseUrl = "https://accept.paymob.com/api";
    this.authToken = null;
    this.tokenExpiry = null;
  }

  async getAuthToken() {
    try {
      if (this.authToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.authToken;
      }
      console.log("🔑 Getting Paymob auth token...");
      const response = await axios.post(`${this.baseUrl}/auth/tokens`, {
        api_key: this.config.apiKey,
      });
      this.authToken = response.data.token;
      this.tokenExpiry = Date.now() + 3600 * 1000;
      console.log("✅ Paymob auth token obtained");
      return this.authToken;
    } catch (error) {
      console.error(
        "❌ Paymob Auth Error:",
        error.response?.data || error.message,
      );
      throw new Error("فشل في المصادقة مع Paymob");
    }
  }

  async createOrder(authToken, amount, paymentId, items = []) {
    try {
      const uniqueOrderId = `${paymentId}_${Date.now()}`;
      console.log("🛒 Creating Paymob order...", {
        amount,
        paymentId,
        orderId: uniqueOrderId,
      });

      const response = await axios.post(`${this.baseUrl}/ecommerce/orders`, {
        auth_token: authToken,
        delivery_needed: "false",
        amount_cents: amount * 100,
        currency: "EGP",
        merchant_order_id: uniqueOrderId,
        items:
          items.length > 0
            ? items
            : [
                {
                  name: "Service Payment",
                  amount_cents: amount * 100,
                  description: "Payment for service",
                  quantity: 1,
                },
              ],
      });

      console.log("✅ Paymob Order Created:", response.data.id);
      return response.data;
    } catch (error) {
      console.error(
        "❌ Paymob Order Error:",
        error.response?.data || error.message,
      );
      throw new Error("فشل في إنشاء طلب Paymob");
    }
  }

  async getPaymentKey(authToken, order, userInfo, amount) {
    try {
      console.log("🔐 Creating payment key...", {
        orderId: order.id,
        amount,
        userEmail: userInfo.email,
      });

      const response = await axios.post(
        `${this.baseUrl}/acceptance/payment_keys`,
        {
          auth_token: authToken,
          amount_cents: amount * 100,
          expiration: 3600,
          order_id: order.id,
          billing_data: {
            apartment: "NA",
            email: userInfo.email || "user@example.com",
            floor: "NA",
            first_name: userInfo.name?.split(" ")[0] || "Customer",
            last_name:
              userInfo.name?.split(" ").slice(1).join(" ") || "Customer",
            street: "NA",
            building: "NA",
            phone_number: userInfo.phone || "01000000000",
            shipping_method: "NA",
            postal_code: "NA",
            city: "Cairo",
            country: "EG",
            state: "NA",
          },
          currency: "EGP",
          integration_id: this.config.integrationId,
          lock_order_when_paid: true,
          // ── Redirect URL: Paymob sends user here after payment ───────────────
          // Must be set in .env as FRONTEND_URL=http://localhost:5173
          // Paymob appends: ?success=true&merchant_order_id=...&id=...
          redirect_url: `${process.env.FRONTEND_URL || process.env.USER_FRONTEND_URL || "http://localhost:5173"}/payment/callback`,
        },
      );

      console.log("✅ Payment key created");
      return response.data.token;
    } catch (error) {
      console.error(
        "❌ Paymob Payment Key Error:",
        error.response?.data || error.message,
      );
      throw new Error("فشل في إنشاء مفتاح الدفع");
    }
  }

  // ─── Main method — called by course.controller.js and payment.service.js ───
  // Signature: initiatePayment(paymentId, amount, userInfo, items)
  async initiatePayment(paymentId, amount, userInfo, items = []) {
    try {
      console.log("💰 Initiating payment...", {
        paymentId,
        amount,
        userEmail: userInfo.email,
      });

      const authToken = await this.getAuthToken();
      const order = await this.createOrder(authToken, amount, paymentId, items);
      const paymentKey = await this.getPaymentKey(
        authToken,
        order,
        userInfo,
        amount,
      );

      // ── Where Paymob sends the user AFTER payment ──────────────────────────
      // This is the React frontend URL — set in .env as FRONTEND_URL
      // After payment, Paymob appends: ?success=true&id=...&merchant_order_id=...
      //
      // Development:  http://localhost:5173/payment/callback
      // Production:   https://ahmedelkhateeb.com/payment/callback
      //
      // Set this in your .env:
      //   FRONTEND_URL=http://localhost:5173      ← dev
      //   FRONTEND_URL=https://ahmedelkhateeb.com ← production
      const frontendUrl =
        process.env.FRONTEND_URL ||
        process.env.USER_FRONTEND_URL ||
        "http://localhost:5173";
      const redirectUrl = `${frontendUrl}/payment/callback`;

      // ── The iframe embed URL (shown inside the payment iframe) ─────────────
      const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${this.config.iframeId}?payment_token=${paymentKey}`;

      // ── The full hosted payment page URL (standalone page, no iframe) ──────
      // This is what we send to the user — they go to this URL, pay, then
      // Paymob redirects them back to redirectUrl above.
      const hostedPageUrl = `https://accept.paymob.com/api/acceptance/iframes/${this.config.iframeId}?payment_token=${paymentKey}`;

      console.log("✅ Payment URLs generated:", { redirect: redirectUrl });

      return {
        success: true,
        paymentKey,
        orderId: order.id,
        merchantOrderId: order.merchant_order_id,
        paymentUrl: hostedPageUrl, // ← frontend opens this URL
        iframeUrl: iframeUrl, // ← same URL, kept for compatibility
        redirectUrl, // ← Paymob returns user here after payment
        details: {
          amount,
          currency: "EGP",
          paymentId,
          createdAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("❌ Payment Initiation Error:", error.message);
      throw error;
    }
  }

  // ─── HMAC verification for Paymob callbacks ───────────────────────────────
  verifyCallback(data, receivedHmac) {
    try {
      const crypto = require("crypto");
      const keys = {
        amount_cents: data.amount_cents,
        created_at: data.created_at,
        currency: data.currency,
        error_occured: data.error_occured,
        has_parent_transaction: data.has_parent_transaction,
        id: data.id,
        integration_id: data.integration_id,
        is_3d_secure: data.is_3d_secure,
        is_auth: data.is_auth,
        is_capture: data.is_capture,
        is_refunded: data.is_refunded,
        is_standalone_payment: data.is_standalone_payment,
        is_voided: data.is_voided,
        order: data.order,
        owner: data.owner,
        pending: data.pending,
        source_data_pan: data.source_data_pan,
        source_data_sub_type: data.source_data_sub_type,
        source_data_type: data.source_data_type,
        success: data.success,
      };

      const concatenated = Object.keys(keys)
        .sort()
        .map((k) => keys[k])
        .join("");
      const calculated = crypto
        .createHmac("sha512", this.config.hmacSecret)
        .update(concatenated)
        .digest("hex");

      return calculated === receivedHmac;
    } catch (error) {
      console.error("❌ HMAC Verification Error:", error);
      return false;
    }
  }

  // Alias — some code calls verifyHmac, some calls verifyCallback
  verifyHmac(data, receivedHmac) {
    return this.verifyCallback(data, receivedHmac);
  }

  async getOrderStatus(orderId) {
    try {
      const authToken = await this.getAuthToken();
      const response = await axios.get(
        `${this.baseUrl}/ecommerce/orders/${orderId}`,
        { headers: { Authorization: `Bearer ${authToken}` } },
      );
      return response.data;
    } catch (error) {
      console.error("❌ Get Order Status Error:", error.message);
      throw error;
    }
  }
}

module.exports = new PaymobService();
