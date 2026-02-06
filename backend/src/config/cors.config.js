module.exports = {
  development: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      "http://localhost:8080",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "token",
      "x-access-token",
      "X-Requested-With",
    ],
    credentials: true,
    exposedHeaders: ["Content-Disposition", "Authorization"],
    maxAge: 86400,
  },

  production: {
    origin: [
      process.env.USER_FRONTEND_URL || "https://user.yourdomain.com",
      process.env.ADMIN_FRONTEND_URL || "https://admin.yourdomain.com",
      process.env.DOCTOR_FRONTEND_URL || "https://admin.yourdomain.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "token",
      "x-access-token",
      "X-Requested-With",
    ],
    credentials: true,
    exposedHeaders: ["Content-Disposition", "Authorization"],
    maxAge: 86400,
  },
};
