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

      console.log("📝 Update profile request:", {
        body: req.body,
        hasFile: !!req.file,
      });

      // Extract fields from request body
      const updateData = {};

      if (req.body.name) updateData.name = req.body.name;
      if (req.body.phone) updateData.phone = req.body.phone;
      if (req.body.gender) updateData.gender = req.body.gender;
      if (req.body.dob) updateData.dob = req.body.dob;

      // ✅ Handle address with ALL fields (line1, line2, city, country)
      let hasAddress = false;
      let addressData = {};

      // Format 1: Parsed object (req.body.address = { line1, line2, city, country })
      if (req.body.address && typeof req.body.address === "object") {
        console.log("📍 Address format 1 (parsed object):", req.body.address);
        addressData = {
          line1: req.body.address.line1 || "",
          line2: req.body.address.line2 || "",
          city: req.body.address.city || "", // ✅ Added
          country: req.body.address.country || "", // ✅ Added
        };
        hasAddress = true;
      }
      // Format 2: FormData bracket notation
      else if (
        req.body["address[line1]"] !== undefined ||
        req.body["address[line2]"] !== undefined ||
        req.body["address[city]"] !== undefined || // ✅ Added
        req.body["address[country]"] !== undefined // ✅ Added
      ) {
        console.log("📍 Address format 2 (bracket notation)");
        addressData = {
          line1: req.body["address[line1]"] || "",
          line2: req.body["address[line2]"] || "",
          city: req.body["address[city]"] || "", // ✅ Added
          country: req.body["address[country]"] || "", // ✅ Added
        };
        hasAddress = true;
      }

      if (hasAddress) {
        // Get existing user to preserve any other address fields (like postalCode)
        const existingUser = await User.findById(userId);

        updateData.address = {
          ...(existingUser?.address || {}),
          ...addressData, // Update all address fields
        };

        console.log("📍 Final address for update:", updateData.address);
      }

      console.log("✅ Update data prepared:", updateData);

      // Validate input
      const { error, value } = userValidation.update.validate(updateData);
      if (error) {
        console.error("❌ Validation error:", error.details);
        return this.validationError(res, error.details);
      }

      // Handle image upload
      if (req.file) {
        try {
          console.log("📸 Uploading image...");
          const imageUpload = await cloudinary.uploadImage(
            req.file.buffer,
            "user-profiles",
          );
          value.image = imageUpload.secure_url;
          console.log("✅ Image uploaded:", value.image);
        } catch (uploadError) {
          console.error("❌ Image upload error:", uploadError);
          return this.error(res, "Failed to upload image");
        }
      }

      // Update user
      const updatedUser = await User.findByIdAndUpdate(userId, value, {
        new: true,
        runValidators: true,
      }).select("-password");

      if (!updatedUser) {
        return this.notFound(res, "User not found");
      }

      console.log("✅ Profile updated successfully:", {
        userId,
        updatedFields: Object.keys(value),
        newAddress: updatedUser.address,
      });

      return this.success(
        res,
        { user: updatedUser },
        "Profile updated successfully",
      );
    } catch (error) {
      console.error("❌ Update profile error:", error);
      return this.error(res, error.message);
    }
  }
}

module.exports = new UserProfileController();
