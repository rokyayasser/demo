const BaseController = require("../BaseController");
const MedicalService = require("../../models/MedicalService");
const cloudinary = require("../../config/cloudinary");
const {
  serviceValidation,
} = require("../../middlewares/validation/service.validation");

class AdminServicesController extends BaseController {
  constructor() {
    super();
    this.addService = this.addService.bind(this);
    this.getAllServices = this.getAllServices.bind(this);
    this.getServiceById = this.getServiceById.bind(this);
    this.updateService = this.updateService.bind(this);
    this.deleteService = this.deleteService.bind(this);
    this.getServicesByCategory = this.getServicesByCategory.bind(this);
    this.changeAvailability = this.changeAvailability.bind(this);
  }

  async addService(req, res) {
    try {
      // Validate input
      const { error, value } = serviceValidation.create.validate(req.body);
      if (error) return this.validationError(res, error.details);

      const {
        title,
        title_ar,
        category,
        category_ar,
        description,
        features,
        fees,
        duration,
      } = value;

      // Check for image file
      if (!req.file) {
        return this.badRequest(res, "Image is required");
      }

      // Upload image to Cloudinary
      let imageUrl;
      try {
        const imageUpload = await cloudinary.uploadImage(
          req.file.buffer,
          "medical-services"
        );
        imageUrl = imageUpload.secure_url;
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        return this.error(res, "Failed to upload image");
      }

      // Parse features if it's a string
      const parsedFeatures =
        typeof features === "string" ? JSON.parse(features) : features;

      // Create service
      const serviceData = {
        title,
        title_ar,
        category,
        category_ar,
        description,
        image: imageUrl,
        features: parsedFeatures,
        fees: Number(fees),
        duration: duration || "30 minutes",
        available: true,
        slots_booked: {},
        date: Date.now(),
      };

      const newService = new MedicalService(serviceData);
      await newService.save();

      console.log("✅ Medical service added successfully:", newService._id);

      return this.success(
        res,
        { service: newService },
        "Service added successfully"
      );
    } catch (error) {
      return this.error(res, error.message);
    }
  }

  async getAllServices(req, res) {
    try {
      const { page = 1, limit = 10, category, available } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const query = {};
      if (category) query.category = category;
      if (available !== undefined) query.available = available === "true";

      const services = await MedicalService.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await MedicalService.countDocuments(query);

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        hasNext: skip + services.length < total,
        hasPrev: parseInt(page) > 1,
      };

      return this.paginatedResponse(
        res,
        services,
        pagination,
        "Services retrieved successfully"
      );
    } catch (error) {
      return this.error(res, error.message);
    }
  }

  async getServiceById(req, res) {
    try {
      const { serviceId } = req.params;

      if (!serviceId) {
        return this.badRequest(res, "Service ID is required");
      }

      const service = await MedicalService.findById(serviceId);

      if (!service) {
        return this.notFound(res, "Service not found");
      }

      return this.success(res, { service }, "Service retrieved successfully");
    } catch (error) {
      return this.error(res, error.message);
    }
  }

  async updateService(req, res) {
    try {
      const { serviceId } = req.params;

      // Validate input
      const { error, value } = serviceValidation.update.validate(req.body);
      if (error) return this.validationError(res, error.details);

      // Check if service exists
      const existingService = await MedicalService.findById(serviceId);
      if (!existingService) {
        return this.notFound(res, "Service not found");
      }

      const updateData = { ...value };

      // Handle image upload if provided
      if (req.file) {
        try {
          // Delete old image from Cloudinary if it exists
          if (existingService.image) {
            const oldPublicId = existingService.image
              .split("/")
              .pop()
              .split(".")[0];
            await cloudinary.deleteImage(`medical-services/${oldPublicId}`);
          }

          // Upload new image
          const imageUpload = await cloudinary.uploadImage(
            req.file.buffer,
            "medical-services"
          );
          updateData.image = imageUpload.secure_url;
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
          return this.error(res, "Failed to upload image");
        }
      }

      // Parse features if provided
      if (value.features) {
        updateData.features =
          typeof value.features === "string"
            ? JSON.parse(value.features)
            : value.features;
      }

      // Update service
      const updatedService = await MedicalService.findByIdAndUpdate(
        serviceId,
        updateData,
        { new: true, runValidators: true }
      );

      return this.success(
        res,
        { service: updatedService },
        "Service updated successfully"
      );
    } catch (error) {
      return this.error(res, error.message);
    }
  }

  async deleteService(req, res) {
    try {
      const { serviceId } = req.params;

      if (!serviceId) {
        return this.badRequest(res, "Service ID is required");
      }

      const service = await MedicalService.findById(serviceId);

      if (!service) {
        return this.notFound(res, "Service not found");
      }

      // Delete image from Cloudinary
      try {
        if (service.image) {
          const publicId = service.image.split("/").pop().split(".")[0];
          await cloudinary.deleteImage(`medical-services/${publicId}`);
        }
      } catch (cloudinaryError) {
        console.warn(
          "Could not delete image from Cloudinary:",
          cloudinaryError.message
        );
      }

      // Delete service
      await MedicalService.findByIdAndDelete(serviceId);

      console.log(`✅ Medical service deleted: ${serviceId}`);

      return this.success(res, null, "Service deleted successfully");
    } catch (error) {
      return this.error(res, error.message);
    }
  }

  async getServicesByCategory(req, res) {
    try {
      const { category } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      if (!category) {
        return this.badRequest(res, "Category parameter is required");
      }

      const services = await MedicalService.find({
        category: { $regex: new RegExp(category, "i") },
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await MedicalService.countDocuments({
        category: { $regex: new RegExp(category, "i") },
      });

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        hasNext: skip + services.length < total,
        hasPrev: parseInt(page) > 1,
      };

      return this.paginatedResponse(
        res,
        services,
        pagination,
        `Services for category ${category} retrieved successfully`
      );
    } catch (error) {
      return this.error(res, error.message);
    }
  }

  async changeAvailability(req, res) {
    try {
      const { serviceId } = req.body;

      if (!serviceId) {
        return this.badRequest(res, "Service ID is required");
      }

      const service = await MedicalService.findById(serviceId);

      if (!service) {
        return this.notFound(res, "Service not found");
      }

      const newAvailability = !service.available;

      await MedicalService.findByIdAndUpdate(serviceId, {
        available: newAvailability,
      });

      return this.success(res, {
        available: newAvailability,
        message: `Service ${newAvailability ? "activated" : "deactivated"} successfully`,
      });
    } catch (error) {
      return this.error(res, error.message);
    }
  }
}

module.exports = new AdminServicesController();
