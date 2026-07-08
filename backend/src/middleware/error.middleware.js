const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const notFound = (req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

const convertToApiError = (err) => {
  if (err instanceof ApiError) return err;

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return ApiError.badRequest('Validation failed', errors);
  }
  if (err.name === 'CastError') {
    return ApiError.badRequest(`Invalid value for ${err.path}`);
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {}).join(', ');
    return ApiError.conflict(`Duplicate value for field: ${field}`);
  }
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return ApiError.unauthorized('Invalid or expired token');
  }
  if (err.name === 'MulterError') {
    return ApiError.badRequest(err.message);
  }

  return ApiError.internal(err.message || 'Something went wrong');
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const apiError = convertToApiError(err);

  if (!apiError.isOperational) {
    logger.error(err.stack || err.message);
  }

  res.status(apiError.statusCode).json({
    success: false,
    statusCode: apiError.statusCode,
    message: apiError.message,
    errors: apiError.errors,
    ...(env.nodeEnv === 'development' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
