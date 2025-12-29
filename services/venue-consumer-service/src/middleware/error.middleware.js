/**
 * Global Error Handler for Venue Consumer Service
 */

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Handle GraphQL/Network errors
  if (err.networkError) {
    statusCode = 503;
    message = 'LOGe service is currently unavailable';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  errorHandler
};
