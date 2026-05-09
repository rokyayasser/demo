const express = require("express");
const router = express.Router();
const {
  getLatestVideos,
} = require("../../controllers/youtube/youtube.controller");

router.get("/latest", getLatestVideos);

module.exports = router;
