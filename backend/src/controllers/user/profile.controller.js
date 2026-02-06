const BaseController = require("../BaseController");
const User = require("../../models/User");
const {
  userValidation,
} = require("../../middlewares/validation/user.validation");
const cloudinary = require("../../config/cloudinary");

class UserProfileController extends BaseController {
  constructor() {
    super();
    this.getProfile = this.getProfile.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
  }

  async getProfile(req, res) {
    try {
      const userId = req.userId;

      const user = await User.findById(userId).select("-password");
      if (!user) {
        return this.notFound(res, "User not found");
      }

      return this.success(res, { user }, "Profile retrieved successfully");
    } catch (error) {
      return this.error(res, error.message);
    }
  }

  async updateProfile(req, res) {
    try {
      const userId = req.userId;

      // Validate input
      const { error, value } = userValidation.update.validate(req.body);
      if (error) return this.validationError(res, error.details);

      const updateData = { ...value };

      // Handle image upload
      if (req.file) {
        try {
          const imageUpload = await cloudinary.uploadImage(
            req.file.buffer,
            "user-profiles"
          );
          updateData.image = imageUpload.secure_url;
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
          return this.error(res, "Failed to upload image");
        }
      }

      // Update user
      const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      }).select("-password");

      if (!updatedUser) {
        return this.notFound(res, "User not found");
      }

      return this.success(
        res,
        { user: updatedUser },
        "Profile updated successfully"
      );
    } catch (error) {
      return this.error(res, error.message);
    }
  }
}

module.exports = new UserProfileController();
