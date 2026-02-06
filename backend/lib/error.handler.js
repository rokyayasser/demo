const { createErrorResponse } = require("../utils/helpers/response.helper");

const notFoundHandler = (req, res, next) => {
  const error = new Error(`Endpoint not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (error, req, res, next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal server error";
  let errors = null;

  // Handle Mongoose validation errors
  if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(error.errors).map((err) => ({
      field: err.path,
      message: err.message,
    }));
  }

  // Handle Mongoose duplicate key errors
  if (error.code === 11000) {
    statusCode = 409;
    message = "Duplicate field value entered";
    errors = [
      {
        field: Object.keys(error.keyPattern)[0],
        message: `This ${Object.keys(error.keyPattern)[0]} already exists`,
      },
    ];
  }

  // Handle JWT errors
  if (error.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (error.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // Handle Multer errors
  if (error.name === "MulterError") {
    statusCode = 400;
    message = error.message;
  }

  // Log error in development
  if (process.env.NODE_ENV === "development") {
    console.error("❌ Error:", {
      message: error.message,
      stack: error.stack,
      statusCode,
      path: req.originalUrl,
      method: req.method,
      body: req.body,
      user: req.userId || "unauthenticated",
    });
  }

  // Create error response
  const errorResponse = createErrorResponse(message, statusCode, errors);

  // Send response
  res.status(errorResponse.statusCode).json(errorResponse.response);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
