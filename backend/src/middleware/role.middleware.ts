import type { NextFunction, Request, Response } from 'express';
import ApiError from '../utils/ApiError';
import type { Role } from '../types/constants';

export const authorize = (...roles: Role[]) => (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user) return next(ApiError.unauthorized());
  if (!roles.includes(req.user.role)) {
    return next(ApiError.forbidden('You do not have permission to perform this action'));
  }
  next();
};
