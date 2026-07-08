const Notification = require('../models/Notification');
const { emitToUser } = require('../sockets');

/**
 * Persists a notification and, if the user has an active socket connection,
 * pushes it in realtime. This is the single entry point every module
 * (orders, chat, listings, verification, coupons) should use to notify users.
 */
const notify = async ({ user, type, title, message, data }) => {
  const notification = await Notification.create({ user, type, title, message, data });
  emitToUser(user, 'notification:new', notification);
  return notification;
};

module.exports = { notify };
