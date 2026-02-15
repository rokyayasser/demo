const cloudinary = require("cloudinary").v2;

class CloudinaryService {
  constructor() {
    this.isConfigured = false;
    // ✅ FIX: Auto-configure when the module loads
    this.configure();
  }

  configure() {
    try {
      // Check if environment variables exist
      if (
        !process.env.CLOUDINARY_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_SECRET_KEY
      ) {
        console.warn(
          "⚠️  Cloudinary environment variables not set. File uploads will be disabled.",
        );
        console.warn(
          "Required: CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_SECRET_KEY",
        );
        this.isConfigured = false;
        return this;
      }

      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_SECRET_KEY,
        secure: true,
      });

      this.isConfigured = true;
      console.log("✅ Cloudinary configured successfully");
      console.log("   Cloud Name:", process.env.CLOUDINARY_NAME);
      return this;
    } catch (error) {
      console.error("❌ Failed to configure Cloudinary:", error);
      this.isConfigured = false;
      return this;
    }
  }

  async uploadImage(buffer, folder = "medical-services", options = {}) {
    if (!this.isConfigured) {
      throw new Error(
        "Cloudinary not configured. Please set CLOUDINARY_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_SECRET_KEY in your .env file",
      );
    }

    return new Promise((resolve, reject) => {
      const uploadOptions = {
        folder,
        resource_type: "image",
        transformation: [{ quality: "auto:good" }, { fetch_format: "auto" }],
        ...options,
      };

      console.log(`📤 Uploading image to folder: ${folder}`);

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error("❌ Cloudinary upload error:", error);
            reject(error);
          } else {
            console.log(`✅ Image uploaded: ${result.secure_url}`);
            resolve(result);
          }
        },
      );

      const { Readable } = require("stream");
      const bufferStream = new Readable();
      bufferStream.push(buffer);
      bufferStream.push(null);
      bufferStream.pipe(uploadStream);
    });
  }

  async uploadFile(
    buffer,
    folder = "appointments",
    originalFilename,
    options = {},
  ) {
    if (!this.isConfigured) {
      throw new Error(
        "Cloudinary not configured. Please set CLOUDINARY_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_SECRET_KEY in your .env file",
      );
    }

    return new Promise((resolve, reject) => {
      const uploadOptions = {
        folder,
        resource_type: "auto",
        type: "upload",
        public_id: originalFilename
          ? originalFilename
              .replace(/\.[^/.]+$/, "")
              .replace(/[^a-zA-Z0-9_-]/g, "_")
          : `file_${Date.now()}`,
        overwrite: false,
        unique_filename: true,
        ...options,
      };

      console.log(`📤 Uploading file to folder: ${folder}`);

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error("❌ Cloudinary file upload error:", error);
            reject(error);
          } else {
            console.log(`✅ File uploaded: ${result.secure_url}`);
            resolve(result.secure_url); // ✅ FIX: Return URL directly (not full result object)
          }
        },
      );

      const { Readable } = require("stream");
      const bufferStream = new Readable();
      bufferStream.push(buffer);
      bufferStream.push(null);
      bufferStream.pipe(uploadStream);
    });
  }

  async deleteImage(publicId) {
    if (!this.isConfigured) {
      console.warn("⚠️  Cloudinary not configured, skipping image deletion");
      return null;
    }

    try {
      console.log(`🗑️  Deleting image: ${publicId}`);
      const result = await cloudinary.uploader.destroy(publicId);
      console.log(`✅ Image deleted: ${publicId}`);
      return result;
    } catch (error) {
      console.error("❌ Error deleting image:", error);
      throw error;
    }
  }

  async deleteResource(publicId, resourceType = "image") {
    if (!this.isConfigured) {
      console.warn("⚠️  Cloudinary not configured, skipping resource deletion");
      return null;
    }

    try {
      console.log(`🗑️  Deleting resource: ${publicId} (${resourceType})`);
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
      console.log(`✅ Resource deleted: ${publicId}`);
      return result;
    } catch (error) {
      console.error("❌ Error deleting resource:", error);
      throw error;
    }
  }

  generateImageUrl(publicId, options = {}) {
    if (!this.isConfigured) {
      console.warn("⚠️  Cloudinary not configured");
      return null;
    }

    return cloudinary.url(publicId, {
      secure: true,
      ...options,
    });
  }
}

// ✅ FIX: Create and configure the singleton instance
const cloudinaryService = new CloudinaryService();

module.exports = cloudinaryService;
