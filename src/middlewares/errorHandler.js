/**
 * Global Error Handler Middleware
 * Catches all errors and returns standardized JSON responses
 */

const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error("[ERROR]", {
    message: err.message,
    status: err.status || 500,
    timestamp: new Date().toISOString(),
  });

  // Extract status code
  const status = err.status || 500;

  // Default error message
  let message = err.message || "Internal server error";

  // Handle specific error types
  if (err.name === "ValidationError") {
    // Mongoose validation error
    const details = Object.values(err.errors).map(e => e.message);
    message = "Validation failed: " + details.join(", ");
    return res.status(400).json({
      success: false,
      status: 400,
      message,
    });
  }

  if (err.name === "MongoError" || err.name === "MongoServerError") {
    // MongoDB duplicate key error
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      message = `${field} already exists`;
      return res.status(409).json({
        success: false,
        status: 409,
        message,
      });
    }
  }

  // Return standardized error response
  res.status(status).json({
    success: false,
    status,
    message,
  });
};

module.exports = errorHandler;
