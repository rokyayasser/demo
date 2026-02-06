class BaseController {
  constructor() {
    this.success = this.success.bind(this);
    this.error = this.error.bind(this);
  }

  success(res, data = null, message = "Success", statusCode = 200) {
    const response = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    if (data && data.pagination) {
      response.pagination = data.pagination;
      response.data = data.data;
    }

    return res.status(statusCode).json(response);
  }

  error(
    res,
    message = "Internal server error",
    statusCode = 500,
    errors = null,
    errorCode = null
  ) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString(),
    };

    if (errorCode) {
      response.errorCode = errorCode;
    }

    if (errors) {
      response.errors = Array.isArray(errors) ? errors : [errors];
    }

    if (process.env.NODE_ENV === "development") {
      if (errors?.stack) {
        response.stack = errors.stack;
      }
    }

    console.error(`❌ Error [${statusCode}]:`, {
      message,
      statusCode,
      errors,
      path: res.req?.originalUrl,
      method: res.req?.method,
    });

    return res.status(statusCode).json(response);
  }

  validationError(res, errors, message = "Validation failed") {
    const formattedErrors = Array.isArray(errors)
      ? errors.map((err) => ({
          field: err.path?.join(".") || "unknown",
          message: err.message || err,
        }))
      : [{ field: "general", message: errors }];

    return this.error(res, message, 400, formattedErrors, "VALIDATION_ERROR");
  }

  notFound(res, message = "Resource not found") {
    return this.error(res, message, 404, null, "NOT_FOUND");
  }

  unauthorized(res, message = "Unauthorized access") {
    return this.error(res, message, 401, null, "UNAUTHORIZED");
  }

  forbidden(res, message = "Forbidden") {
    return this.error(res, message, 403, null, "FORBIDDEN");
  }

  conflict(res, message = "Resource conflict") {
    return this.error(res, message, 409, null, "CONFLICT");
  }

  tooManyRequests(res, message = "Too many requests") {
    return this.error(res, message, 429, null, "RATE_LIMIT_EXCEEDED");
  }

  badRequest(res, message = "Bad request") {
    return this.error(res, message, 400, null, "BAD_REQUEST");
  }

  paginatedResponse(
    res,
    data,
    pagination,
    message = "Data retrieved successfully"
  ) {
    return this.success(
      res,
      {
        data,
        pagination: {
          page: pagination.page || 1,
          limit: pagination.limit || 10,
          total: pagination.total || 0,
          pages:
            pagination.pages ||
            Math.ceil((pagination.total || 0) / (pagination.limit || 10)),
          hasNext: pagination.hasNext || false,
          hasPrev: pagination.hasPrev || false,
        },
      },
      message
    );
  }
}

module.exports = BaseController;
