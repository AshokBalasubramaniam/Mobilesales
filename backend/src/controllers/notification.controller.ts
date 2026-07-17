import type { Request, Response } from "express";
import type { FilterQuery } from "mongoose";
import Notification from "../models/Notification";
import { convertToApiError } from "../middleware/error.middleware";
import logger from "../utils/logger";
import { getPagination, buildMeta } from "../utils/pagination";
import type { INotification } from "../types/models";

const sendError = (res: Response, action: string, error: unknown): void => {
  logger.error(`Failed to ${action}`, error);
  const apiError = convertToApiError(error as Error);
  res
    .status(apiError.statusCode)
    .json({ flag: "error", message: apiError.message });
};

interface NotificationListQuery {
  page?: string;
  limit?: string;
  isRead?: string;
}

export const listMyNotifications = async (
  req: Request<Record<string, never>, unknown, unknown, NotificationListQuery>,
  res: Response,
) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter: FilterQuery<INotification> = { user: req.user!._id };
    if (req.query.isRead !== undefined)
      filter.isRead = req.query.isRead === "true";

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(filter),
      Notification.countDocuments({ user: req.user!._id, isRead: false }),
    ]);

    res.status(200).json({
      flag: "success",
      data: notifications,
      message: "Notifications fetched",
      meta: { ...buildMeta({ page, limit, total }), unreadCount },
    });
  } catch (error) {
    sendError(res, "fetch notifications", error);
  }
};

export const markAsRead = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user!._id },
      { isRead: true, readAt: new Date() },
      { new: true },
    );
    if (!notification) {
      return res
        .status(404)
        .json({ flag: "error", message: "Notification not found" });
    }

    res
      .status(200)
      .json({ flag: "success", data: notification, message: "Marked as read" });
  } catch (error) {
    sendError(res, "mark notification as read", error);
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    await Notification.updateMany(
      { user: req.user!._id, isRead: false },
      { isRead: true, readAt: new Date() },
    );
    res
      .status(200)
      .json({
        flag: "success",
        data: null,
        message: "All notifications marked as read",
      });
  } catch (error) {
    sendError(res, "mark all notifications as read", error);
  }
};

export const deleteNotification = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const deleted = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user!._id,
    });
    if (!deleted) {
      return res
        .status(404)
        .json({ flag: "error", message: "Notification not found" });
    }
    res
      .status(200)
      .json({ flag: "success", data: null, message: "Notification deleted" });
  } catch (error) {
    sendError(res, "delete notification", error);
  }
};
