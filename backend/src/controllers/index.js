// Export all controllers
module.exports = {
  // Base Controller
  BaseController: require("./BaseController"),

  // User Controllers
  user: {
    auth: require("./user/auth.controller"),
    profile: require("./user/profile.controller"),
    appointments: require("./user/appointments.controller"),
  },

  // Admin Controllers
  admin: {
    auth: require("./admin/auth.controller"),
    services: require("./admin/services.controller"),
    appointments: require("./admin/appointments.controller"),
    slots: require("./admin/slots.controller"),
  },

  // Doctor Controllers
  doctor: {
    auth: require("./doctor/auth.controller"),
    appointments: require("./doctor/appointments.controller"),
    dashboard: require("./doctor/dashboard.controller"),
  },

  // Shared Controllers
  shared: {
    appointment: require("./shared/appointment.controller"),
    payment: require("./shared/payment.controller"),
    download: require("./shared/download.controller"),
  },
};
