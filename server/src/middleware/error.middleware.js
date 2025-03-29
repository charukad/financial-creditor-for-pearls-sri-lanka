const logger = require("../utils/logger");
const { NODE_ENV } = require("../config/environment");

// Central error handling middleware
const errorMiddleware = (err, req, res, next) => {
  // Log the error
  logger.error(`${err.name}: ${err.message}`);

  // Set default error values
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    stack: NODE_ENV === "development" ? err.stack : undefined,
  });
};

module.exports = errorMiddleware;
