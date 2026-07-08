const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { getPagination, buildMeta } = require('../utils/pagination');

const listMyNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { user: req.user._id };
  if (req.query.isRead !== undefined) filter.isRead = req.query.isRead === 'true';

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: req.user._id, isRead: false }),
  ]);

  new ApiResponse(200, notifications, 'Notifications fetched', { ...buildMeta({ page, limit, total }), unreadCount }).send(res);
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
  if (!notification) throw ApiError.notFound('Notification not found');

  new ApiResponse(200, notification, 'Marked as read').send(res);
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });
  new ApiResponse(200, null, 'All notifications marked as read').send(res);
});

const deleteNotification = asyncHandler(async (req, res) => {
  const deleted = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!deleted) throw ApiError.notFound('Notification not found');
  new ApiResponse(200, null, 'Notification deleted').send(res);
});

module.exports = { listMyNotifications, markAsRead, markAllAsRead, deleteNotification };
