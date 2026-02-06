const createSuccessResponse = (
  data = null,
  message = "Success",
  statusCode = 200
) => {
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

  return { statusCode, response };
};

const createErrorResponse = (
  message = "Internal server error",
  statusCode = 500,
  errors = null,
  errorCode = null
) => {
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

  return { statusCode, response };
};

const createPaginatedResponse = (
  data,
  pagination,
  message = "Data retrieved successfully"
) => {
  return {
    success: true,
    message,
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
    timestamp: new Date().toISOString(),
  };
};

module.exports = {
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
};
