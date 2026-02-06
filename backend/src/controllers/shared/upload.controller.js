const BaseController = require("../BaseController");
const cloudinary = require("../../config/cloudinary");

class UploadController extends BaseController {
  constructor() {
    super();
    this.uploadFile = this.uploadFile.bind(this);
    this.uploadImage = this.uploadImage.bind(this);
    this.deleteFile = this.deleteFile.bind(this);
  }

  async uploadFile(req, res) {
    try {
      if (!req.file) {
        return this.badRequest(res, "File is required");
      }

      const { folder = "appointments", originalname } = req.body;
      const fileBuffer = req.file.buffer;

      const uploadResult = await cloudinary.uploadFile(
        fileBuffer,
        folder,
        originalname || req.file.originalname
      );

      return this.success(
        res,
        {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          format: uploadResult.format,
          size: uploadResult.bytes,
        },
        "File uploaded successfully"
      );
    } catch (error) {
      console.error("Upload File Error:", error);
      return this.error(res, error.message);
    }
  }

  async uploadImage(req, res) {
    try {
      if (!req.file) {
        return this.badRequest(res, "Image is required");
      }

      const { folder = "medical-services" } = req.body;
      const imageBuffer = req.file.buffer;

      const uploadResult = await cloudinary.uploadImage(imageBuffer, folder);

      return this.success(
        res,
        {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          format: uploadResult.format,
          size: uploadResult.bytes,
        },
        "Image uploaded successfully"
      );
    } catch (error) {
      console.error("Upload Image Error:", error);
      return this.error(res, error.message);
    }
  }

  async deleteFile(req, res) {
    try {
      const { publicId, resourceType = "image" } = req.body;

      if (!publicId) {
        return this.badRequest(res, "Public ID is required");
      }

      const result = await cloudinary.deleteResource(publicId, resourceType);

      return this.success(
        res,
        {
          result,
        },
        "File deleted successfully"
      );
    } catch (error) {
      console.error("Delete File Error:", error);
      return this.error(res, error.message);
    }
  }
}

module.exports = new UploadController();
