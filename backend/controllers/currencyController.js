// backend/controllers/currencyController.js
const axios = require("axios");

const getExchangeRate = async (req, res) => {
  try {
    // You can use various APIs - here are a few options:
    // 1. Fixer API (free tier): https://fixer.io/
    // 2. ExchangeRate-API (free): https://www.exchangerate-api.com/
    // 3. Open Exchange Rates (free tier): https://openexchangerates.org/

    // For demo, using a free API
    const response = await axios.get(
      `https://api.exchangerate-api.com/v4/latest/EGP`
      // Or use: `https://api.exchangerate-api.com/v4/latest/USD`
    );

    const rate = response.data.rates.USD || 0.052; // Default fallback

    res.json({
      success: true,
      rate: rate,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Currency API error:", error);
    // Fallback rate (approx 1 USD = 50 EGP)
    res.json({
      success: true,
      rate: 0.02, // 1 EGP = 0.02 USD
      lastUpdated: new Date().toISOString(),
      isFallback: true,
    });
  }
};

module.exports = { getExchangeRate };
