import type { NextFunction, Request, Response } from 'express';
import type { Role } from '../types/constants';

export const authorize = (...roles: Role[]) => (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ flag: 'error', message: 'Unauthorized' });
    return;
  }
  if (!roles.includes(req.user.role)) {
    res.status(403).json({ flag: 'error', message: 'You do not have permission to perform this action' });
    return;
  }
  next();
};
