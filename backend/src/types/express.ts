import type { HydratedDocument } from 'mongoose';
import type { IUser, IUserMethods } from './models';

export type AuthenticatedUser = HydratedDocument<IUser, IUserMethods>;

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
