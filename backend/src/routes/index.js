const express = require("express");
const router = express.Router();

// Import versioned routes
const v1Routes = require("./v1");

// Mount versioned routes
router.use("/v1", v1Routes);

module.exports = router;
