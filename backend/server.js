require("dotenv").config();
require("./src/models/Blockedslot");
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
  }),
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

// ─── Route loader helper ───────────────────────────────────────────────────
// Tries to mount a route file; warns but never crashes if the file is missing.
const loadRoute = (routePath, mountPoint) => {
  try {
    const router = require(routePath);
    app.use(mountPoint, router);
    console.log(`✅ Loaded: ${mountPoint}`);
  } catch (error) {
    console.warn(`⚠️  Skipped ${mountPoint}: ${error.message}`);
  }
};

// ─── Existing routes ──────────────────────────────────────────────────────
loadRoute("./src/routes/v1/admin.routes", "/api/v1/admin");
loadRoute("./src/routes/v1/user.routes", "/api/v1/user");
loadRoute("./src/routes/v1/doctor.routes", "/api/v1/doctor");
loadRoute("./src/routes/v1/appointment.routes", "/api/v1/appointments");
loadRoute("./src/routes/v1/payment.routes", "/api/v1/payment");

// ─── New routes ───────────────────────────────────────────────────────────
loadRoute("./src/routes/v1/courses.routes", "/api/v1/courses");
loadRoute("./src/routes/v1/products.routes", "/api/v1/products");

// Serve static files
app.use("/public", express.static(path.join(__dirname, "public")));

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    path: req.originalUrl,
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("❌ Error:", error);
  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
  });
});

// ─── Start ────────────────────────────────────────────────────────────────
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
