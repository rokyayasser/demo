require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

// Create Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || "DoctorDB",
    });
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

// Basic middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Import routes - use require inside async function to handle missing files
let adminRoutes, userRoutes, doctorRoutes, appointmentRoutes, paymentRoutes;

// Try to load routes, but don't crash if files are missing
try {
  adminRoutes = require("./src/routes/v1/admin.routes");
  app.use("/api/v1/admin", adminRoutes);
  console.log("✅ Admin routes loaded");
} catch (error) {
  console.warn("⚠️ Admin routes not loaded:", error.message);
}

try {
  userRoutes = require("./src/routes/v1/user.routes");
  app.use("/api/v1/user", userRoutes);
  console.log("✅ User routes loaded");
} catch (error) {
  console.warn("⚠️ User routes not loaded:", error.message);
}

try {
  doctorRoutes = require("./src/routes/v1/doctor.routes");
  app.use("/api/v1/doctor", doctorRoutes);
  console.log("✅ Doctor routes loaded");
} catch (error) {
  console.warn("⚠️ Doctor routes not loaded:", error.message);
}

try {
  appointmentRoutes = require("./src/routes/v1/appointment.routes");
  app.use("/api/v1/appointments", appointmentRoutes);
  console.log("✅ Appointment routes loaded");
} catch (error) {
  console.warn("⚠️ Appointment routes not loaded:", error.message);
}

try {
  paymentRoutes = require("./src/routes/v1/payment.routes");
  app.use("/api/v1/payment", paymentRoutes);
  console.log("✅ Payment routes loaded");
} catch (error) {
  console.warn("⚠️ Payment routes not loaded:", error.message);
}

// Serve static files
app.use("/public", express.static(path.join(__dirname, "public")));

// 404 handler - FIXED: Don't use '*' wildcard in Express 5
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    path: req.originalUrl,
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error("❌ Error:", error);
  res.status(500).json({
    success: false,
    message: error.message || "Internal server error",
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log("=".repeat(50));
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`📚 API Base URL: http://localhost:${PORT}/api/v1`);
      console.log("=".repeat(50));
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
