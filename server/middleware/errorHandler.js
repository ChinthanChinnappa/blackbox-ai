// Global error handling middleware
// EDGE CASE: Stack traces exposed in development — must be disabled in production

const errorHandler = (err, req, res, next) => {
  console.error('[ERROR]', err.message);

  const statusCode = err.statusCode || 500;
  const response = {
    error: err.message || 'Internal Server Error',
    // Only expose stack in dev
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
