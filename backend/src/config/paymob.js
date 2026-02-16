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
      console.error("❌ Paymob Auth Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
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
                  name: "Medical Appointment",
                  amount_cents: amount * 100,
                  description: "Payment for medical appointment service",
                  quantity: 1,
                },
              ],
      });

      console.log("✅ Paymob Order Created:", response.data.id);
      return response.data;
    } catch (error) {
      console.error("❌ Paymob Order Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
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
            email: userInfo.email,
            floor: "NA",
            first_name:
              userInfo.name?.split(" ")[0] || userInfo.name || "Customer",
            street: "NA",
            building: "NA",
            phone_number: userInfo.phone || "01000000000",
            shipping_method: "NA",
            postal_code: "NA",
            city: "Cairo",
            country: "EG",
            last_name:
              userInfo.name?.split(" ").slice(1).join(" ") ||
              userInfo.name ||
              "Customer",
            state: "NA",
          },
          currency: "EGP",
          integration_id: this.config.integrationId,
          lock_order_when_paid: true,
        },
      );

      console.log("✅ Payment key created successfully");
      return response.data.token;
    } catch (error) {
      console.error("❌ Paymob Payment Key Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw new Error("فشل في إنشاء مفتاح الدفع");
    }
  }
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

      // ✅ Generate payment URLs
      const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${this.config.iframeId}?payment_token=${paymentKey}`;

      // ✅ CHANGE THIS: Use your own hosted page instead of Paymob's standalone URL
      const hostedPageUrl = `${process.env.BACKEND_URL || "http://localhost:4000"}/api/v1/payment/page/${paymentKey}`;

      console.log("✅ Payment URLs generated:", {
        hostedPage: hostedPageUrl,
        iframe: iframeUrl.substring(0, 80) + "...",
      });

      return {
        success: true,
        paymentKey,
        orderId: order.id,
        merchantOrderId: order.merchant_order_id,
        paymentUrl: hostedPageUrl, // ✅ Changed to hosted page
        iframeUrl: iframeUrl,
        details: {
          amount,
          currency: "EGP",
          paymentId,
          createdAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("❌ Payment Initiation Error:", error);
      throw error;
    }
  }

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

      const concatenatedString = Object.keys(keys)
        .sort()
        .map((key) => keys[key])
        .join("");

      const calculatedHmac = crypto
        .createHmac("sha512", this.config.hmacSecret)
        .update(concatenatedString)
        .digest("hex");

      console.log("🔒 HMAC Verification:", {
        calculated: calculatedHmac,
        received: receivedHmac,
        match: calculatedHmac === receivedHmac,
      });

      return calculatedHmac === receivedHmac;
    } catch (error) {
      console.error("❌ HMAC Verification Error:", error);
      return false;
    }
  }

  async getOrderStatus(orderId) {
    try {
      const authToken = await this.getAuthToken();

      const response = await axios.get(
        `${this.baseUrl}/ecommerce/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error("❌ Get Order Status Error:", error);
      throw error;
    }
  }
}

module.exports = new PaymobService();
