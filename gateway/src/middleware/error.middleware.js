/**
 * Error Handling Middleware for API Gateway
 */

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
};

/**
 * Global Error Handler
 */
const errorHandler = (err, req, res, next) => {
  console.error('Gateway Error:', err);

  // Handle Axios errors (from proxy requests)
  if (err.response) {
    return res.status(err.response.status).json({
      success: false,
      message: err.response.data?.message || 'Service error',
      ...err.response.data
    });
  }

  // Handle connection errors
  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable',
      error: 'Could not connect to microservice'
    });
  }

  // Handle timeout errors
  if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT') {
    return res.status(504).json({
      success: false,
      message: 'Service timeout',
      error: 'Microservice took too long to respond'
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
