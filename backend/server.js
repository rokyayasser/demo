require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

// Create Express app
const app = express();
const PORT = process.env.PORT || 4000;

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Reads FRONTEND_URL and ADMIN_FRONTEND_URL from environment variables
// so you never need to hardcode Vercel URLs again
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  // Production URLs from Render environment variables
  process.env.FRONTEND_URL, // e.g. https://pharmacology.vercel.app
  process.env.ADMIN_FRONTEND_URL, // e.g. https://pharmacology-admin.vercel.app
].filter(Boolean); // remove undefined entries

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, curl, server-to-server)
      if (!origin) return callback(null, true);
      // Allow any vercel.app subdomain automatically
      if (origin.endsWith(".vercel.app")) return callback(null, true);
      // Allow specific origins from the list
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Block everything else
      console.warn("CORS blocked:", origin);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

// ─── Database connection ──────────────────────────────────────────────────────
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

// ─── Basic middleware ─────────────────────────────────────────────────────────
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

app.get("/", (req, res) => {
  res.json({ success: true, message: "Pharmacology API is running" });
});

// ─── Pre-register models that other modules depend on ────────────────────────
// Must be required BEFORE routes so mongoose.models.X is populated
try {
  require("./src/models/Blockedslot");
} catch (e) {
  // ← capital S
  console.warn("BlockedSlot model:", e.message);
}
try {
  require("./src/models/Courseenrollment");
} catch (e) {
  console.warn("CourseEnrollment model:", e.message);
}
try {
  require("./src/models/Course");
} catch (e) {
  console.warn("Course model:", e.message);
}

// ─── Route loader ─────────────────────────────────────────────────────────────
const loadRoute = (routePath, mountPoint) => {
  try {
    const router = require(routePath);
    app.use(mountPoint, router);
    console.log(`✅ Loaded: ${mountPoint}`);
  } catch (error) {
    console.warn(`⚠️  Skipped ${mountPoint}: ${error.message}`);
  }
};

// ─── Routes ───────────────────────────────────────────────────────────────────
loadRoute("./src/routes/v1/admin.routes", "/api/v1/admin");
loadRoute("./src/routes/v1/user.routes", "/api/v1/user");
loadRoute("./src/routes/v1/doctor.routes", "/api/v1/doctor");
loadRoute("./src/routes/v1/appointment.routes", "/api/v1/appointments");
loadRoute("./src/routes/v1/payment.routes", "/api/v1/payment");
loadRoute("./src/routes/v1/courses.routes", "/api/v1/courses");
loadRoute("./src/routes/v1/products.routes", "/api/v1/products");
loadRoute("./src/routes/v1/youtube.routes", "/api/v1/youtube");

// Static files
app.use("/public", express.static(path.join(__dirname, "public")));

// 404 handler
app.use((req, res) => {
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

// ─── Start ────────────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log("=".repeat(50));
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔒 Allowed origins: ${allowedOrigins.join(", ")}`);
      console.log("=".repeat(50));
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
