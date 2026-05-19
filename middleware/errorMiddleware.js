// middleware/errorMiddleware.js - Global Error Handling (Q2 - Middleware)
/**
 * notFound - Handles 404 errors for undefined routes
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route Not Found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * errorHandler - Global error handler middleware
 * Returns structured JSON error responses
 */
const errorHandler = (err, req, res, next) => {
  // Default to 500 if status is still 200
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message,
    // Show stack trace only in development
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
