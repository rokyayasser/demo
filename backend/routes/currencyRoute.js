// backend/routes/currencyRoutes.js
const express = require("express");
const { getExchangeRate } = require("../controllers/currencyController");

const router = express.Router();

router.get("/rate", getExchangeRate);

module.exports = router;
