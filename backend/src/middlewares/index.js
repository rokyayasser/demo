// Export all middlewares
module.exports = {
  // Auth Middlewares
  auth: {
    admin: require("./auth/admin.auth"),
    doctor: require("./auth/doctor.auth"),
    user: require("./auth/user.auth"),
  },

  // Validation Middlewares
  validation: {
    user: require("./validation/user.validation"),
    appointment: require("./validation/appointment.validation"),
    service: require("./validation/service.validation"),
  },

  // Upload Middlewares
  upload: {
    multer: require("./upload/multer.config"),
    formDataParser: require("./upload/formDataParser"),
  },
};
