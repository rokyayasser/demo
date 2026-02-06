const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const path = require("path");

// Import configurations
const corsConfig = require("./config/cors.config");
const { errorHandler, notFoundHandler } = require("./lib/error.handler");
const { setupDatabase } = require("./lib/database.connection");
const { setupCloudinary } = require("./config/cloudinary");

// Import routes
const routes = require("./routes");

class App {
  constructor() {
    this.app = express();
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddlewares() {
    // Security headers
    this.app.use(
      helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        contentSecurityPolicy: false,
      })
    );

    // CORS configuration
    this.app.use(cors(corsConfig[process.env.NODE_ENV || "development"]));

    // Compression
    this.app.use(compression());

    // Logging
    if (process.env.NODE_ENV === "development") {
      this.app.use(morgan("dev"));
    } else {
      this.app.use(morgan("combined"));
    }

    // Body parsers
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Static files
    this.app.use(
      "/uploads",
      express.static(path.join(__dirname, "../uploads"))
    );

    // Request logger middleware
    this.app.use((req, res, next) => {
      console.log(`\n📥 ${req.method} ${req.url}`);
      console.log("Headers:", req.headers);
      if (req.method === "POST" || req.method === "PUT") {
        console.log("Body:", JSON.stringify(req.body, null, 2));
      }
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get("/health", (req, res) => {
      res.json({
        success: true,
        message: "Medical Appointment API is healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
        version: "1.0.0",
      });
    });

    // API routes
    this.app.use("/api/v1", routes);

    // Serve static files for frontend
    this.app.use(express.static(path.join(__dirname, "../public")));

    // Catch-all route
    this.app.get("*", (req, res) => {
      res.status(404).json({
        success: false,
        message: "API endpoint not found",
        path: req.path,
      });
    });
  }

  setupErrorHandling() {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  async initialize() {
    try {
      // Connect to database
      await setupDatabase();

      // Setup Cloudinary
      await setupCloudinary();

      console.log("✅ Application initialized successfully");
      return this.app;
    } catch (error) {
      console.error("❌ Failed to initialize application:", error);
      process.exit(1);
    }
  }
}

module.exports = new App().app;
