// userRoute.js
const express = require("express");
const userController = require("../controllers/userController.js");
const authUser = require("../middlewares/authUser.js");
const { upload, checkUploadErrors } = require("../middlewares/multer.js");

const router = express.Router();

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/profile", authUser, userController.getUserProfile);
router.post(
  "/update-profile",
  authUser,
  upload.single("image"),
  checkUploadErrors,
  userController.updateUserProfile
);

module.exports = router;
