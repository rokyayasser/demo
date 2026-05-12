// src/config/paymob.js
"use strict";
const axios = require("axios");

class PaymobService {
  constructor() {
    this.config = {
      apiKey: process.env.PAYMOB_API_KEY,
      // ── EGP integration (existing) ───────────────────────────────────────
      integrationId: process.env.PAYMOB_INTEGRATION_ID,
      iframeId: process.env.PAYMOB_IFRAME_ID,
      // ── USD integration (new — set these in Render env vars) ────────────
      // Create a new integration in Paymob dashboard with currency = USD
      // then set these two env vars
      usdIntegrationId: process.env.PAYMOB_USD_INTEGRATION_ID,
      usdIframeId: process.env.PAYMOB_USD_IFRAME_ID,
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

  // ── Create order — currency can be "EGP" or "USD" ──────────────────────────
  async createOrder(
    authToken,
    amount,
    paymentId,
    currency = "EGP",
    items = [],
  ) {
    try {
      const uniqueOrderId = `${paymentId}_${Date.now()}`;
      console.log("🛒 Creating Paymob order...", {
        amount,
        currency,
        paymentId,
        orderId: uniqueOrderId,
      });

      const response = await axios.post(`${this.baseUrl}/ecommerce/orders`, {
        auth_token: authToken,
        delivery_needed: "false",
        amount_cents: Math.round(amount * 100), // works for both EGP and USD cents
        currency, // "EGP" or "USD"
        merchant_order_id: uniqueOrderId,
        items:
          items.length > 0
            ? items
            : [
                {
                  name: "Service Payment",
                  amount_cents: Math.round(amount * 100),
                  description: `Payment in ${currency}`,
                  quantity: 1,
                },
              ],
      });

      console.log(
        "✅ Paymob Order Created:",
        response.data.id,
        "Currency:",
        currency,
      );
      return response.data;
    } catch (error) {
      console.error(
        "❌ Paymob Order Error:",
        error.response?.data || error.message,
      );
      throw new Error("فشل في إنشاء طلب Paymob");
    }
  }

  // ── Get payment key — picks correct integration ID based on currency ────────
  async getPaymentKey(authToken, order, userInfo, amount, currency = "EGP") {
    try {
      // Use USD integration only if PAYMOB_USD_INTEGRATION_ID is configured.
      // If not set, fall back to EGP integration and send amount in EGP
      // (Paymob will reject USD on an EGP integration).
      const hasUsdIntegration = !!(
        this.config.usdIntegrationId && this.config.usdIframeId
      );

      const integrationId =
        currency === "USD" && hasUsdIntegration
          ? this.config.usdIntegrationId
          : this.config.integrationId;

      const iframeId =
        currency === "USD" && hasUsdIntegration
          ? this.config.usdIframeId
          : this.config.iframeId;

      // If USD requested but no USD integration → charge in EGP
      // The amount passed in is already in the correct currency from the controller
      const effectiveCurrency =
        currency === "USD" && !hasUsdIntegration ? "EGP" : currency;

      if (currency === "USD" && !hasUsdIntegration) {
        console.warn(
          "⚠️  USD payment requested but PAYMOB_USD_INTEGRATION_ID not set. Falling back to EGP.",
        );
        console.warn(
          "   Set PAYMOB_USD_INTEGRATION_ID and PAYMOB_USD_IFRAME_ID in your .env to enable USD payments.",
        );
      }

      console.log("🔐 Creating payment key...", {
        orderId: order.id,
        amount,
        currency,
        integrationId,
        userEmail: userInfo.email,
      });

      const response = await axios.post(
        `${this.baseUrl}/acceptance/payment_keys`,
        {
          auth_token: authToken,
          amount_cents: Math.round(amount * 100),
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
          currency: effectiveCurrency, // use EGP fallback if no USD integration
          integration_id: integrationId,
          lock_order_when_paid: true,
          redirect_url: `${
            process.env.FRONTEND_URL ||
            process.env.USER_FRONTEND_URL ||
            "http://localhost:5173"
          }/payment/callback`,
        },
      );

      console.log("✅ Payment key created for", currency);
      return { token: response.data.token, iframeId };
    } catch (error) {
      console.error(
        "❌ Paymob Payment Key Error:",
        error.response?.data || error.message,
      );
      throw new Error("فشل في إنشاء مفتاح الدفع");
    }
  }

  // ─── Main method ────────────────────────────────────────────────────────────
  // currency: "EGP" | "USD"
  // amount:   amount in the specified currency (EGP or USD)
  async initiatePayment(
    paymentId,
    amount,
    userInfo,
    items = [],
    currency = "EGP",
  ) {
    try {
      console.log("💰 Initiating payment...", {
        paymentId,
        amount,
        currency,
        userEmail: userInfo.email,
      });

      const authToken = await this.getAuthToken();
      // Check if USD integration is configured — if not, fall back to EGP
      const hasUsdIntegration = !!(
        this.config.usdIntegrationId && this.config.usdIframeId
      );
      const effectiveCurrency =
        currency === "USD" && !hasUsdIntegration ? "EGP" : currency;

      const order = await this.createOrder(
        authToken,
        amount,
        paymentId,
        effectiveCurrency,
        items,
      );
      const { token: paymentKey, iframeId } = await this.getPaymentKey(
        authToken,
        order,
        userInfo,
        amount,
        effectiveCurrency,
      );

      const frontendUrl =
        process.env.FRONTEND_URL ||
        process.env.USER_FRONTEND_URL ||
        "http://localhost:5173";
      const redirectUrl = `${frontendUrl}/payment/callback`;
      const paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentKey}`;

      console.log("✅ Payment URLs generated:", {
        redirect: redirectUrl,
        currency,
      });

      return {
        success: true,
        paymentKey,
        orderId: order.id,
        merchantOrderId: order.merchant_order_id,
        paymentUrl,
        iframeUrl: paymentUrl,
        redirectUrl,
        details: {
          amount,
          currency,
          paymentId,
          createdAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("❌ Payment Initiation Error:", error.message);
      throw error;
    }
  }

  // ─── HMAC verification ─────────────────────────────────────────────────────
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
      const calculated = require("crypto")
        .createHmac("sha512", this.config.hmacSecret)
        .update(concatenated)
        .digest("hex");
      return calculated === receivedHmac;
    } catch (error) {
      console.error("❌ HMAC Verification Error:", error);
      return false;
    }
  }

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
