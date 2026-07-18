import type { Types } from 'mongoose';
import Notification from '../models/Notification';
import { emitToUser } from '../sockets';
import type { NotificationType } from '../types/constants';

export interface NotifyArgs {
  user: Types.ObjectId | string;
  type: NotificationType;
  title: string;
  message: string;
  data?: unknown;
}

/**
 * Persists a notification and, if the user has an active socket connection,
 * pushes it in realtime. This is the single entry point every module
 * (orders, chat, listings, verification, coupons) should use to notify users.
 */
export const notify = async ({ user, type, title, message, data }: NotifyArgs) => {
  const notification = await Notification.create({ user, type, title, message, data });
  emitToUser(user, 'notification:new', notification);
  return notification;
};
