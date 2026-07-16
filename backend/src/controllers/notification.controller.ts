import type { Request, Response } from 'express';
import type { FilterQuery } from 'mongoose';
import Notification from '../models/Notification';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import { getPagination, buildMeta } from '../utils/pagination';
import type { INotification } from '../types/models';

interface NotificationListQuery {
  page?: string;
  limit?: string;
  isRead?: string;
}

export const listMyNotifications = asyncHandler(async (req: Request<Record<string, never>, unknown, unknown, NotificationListQuery>, res: Response) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter: FilterQuery<INotification> = { user: req.user!._id };
  if (req.query.isRead !== undefined) filter.isRead = req.query.isRead === 'true';

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: req.user!._id, isRead: false }),
  ]);

  new ApiResponse(200, notifications, 'Notifications fetched', { ...buildMeta({ page, limit, total }), unreadCount }).send(res);
});

export const markAsRead = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user!._id },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
  if (!notification) throw ApiError.notFound('Notification not found');

  new ApiResponse(200, notification, 'Marked as read').send(res);
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  await Notification.updateMany({ user: req.user!._id, isRead: false }, { isRead: true, readAt: new Date() });
  new ApiResponse(200, null, 'All notifications marked as read').send(res);
});

export const deleteNotification = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const deleted = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user!._id });
  if (!deleted) throw ApiError.notFound('Notification not found');
  new ApiResponse(200, null, 'Notification deleted').send(res);
});
