import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import env from '../config/env';
import ApiError from '../utils/ApiError';
import logger from '../utils/logger';

interface MongoDuplicateKeyError extends Error {
  code: number;
  keyValue?: Record<string, unknown>;
}

const hasCode = (err: Error): err is MongoDuplicateKeyError => 'code' in err;

export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

const convertToApiError = (err: Error): ApiError => {
  if (err instanceof ApiError) return err;

  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => e.message);
    return ApiError.badRequest('Validation failed', errors);
  }
  if (err instanceof mongoose.Error.CastError) {
    return ApiError.badRequest(`Invalid value for ${err.path}`);
  }
  if (hasCode(err) && err.code === 11000) {
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
export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
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
