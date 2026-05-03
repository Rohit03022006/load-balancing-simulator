const logger = require("../utils/logger");

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error("Error:", {
    message: error.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: "Invalid JSON payload",
    });
  }

  // PostgreSQL errors
  if (err.code) {
    switch (err.code) {
      case "23505": // Unique violation
        error = new AppError("Duplicate entry", 409);
        break;
      case "23503": // Foreign key violation
        error = new AppError("Referenced resource not found", 404);
        break;
      case "42P01": // Undefined table
        error = new AppError("Database schema error", 500);
        break;
      default:
        error = new AppError("Database error", 500);
    }
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error = new AppError("Invalid token", 401);
  }

  if (err.name === "TokenExpiredError") {
    error = new AppError("Token expired", 401);
  }

  // Send response
  const statusCode = error.statusCode || 500;
  const message = error.isOperational ? error.message : "Internal server error";

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = {
  errorHandler,
  AppError,
};
