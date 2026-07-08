const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

const extractToken = (req) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) return header.slice(7);
  return null;
};

const protect = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized('Authentication token missing');

  let payload;
  try {
    payload = jwt.verify(token, env.jwt.accessSecret);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired token');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw ApiError.unauthorized('User no longer exists');
  if (user.isBlocked) throw ApiError.forbidden('Your account has been blocked');

  req.user = user;
  next();
});

const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, env.jwt.accessSecret);
    const user = await User.findById(payload.sub);
    if (user && !user.isBlocked) req.user = user;
  } catch (err) {
    // ignore invalid token for optional auth
  }
  next();
});

module.exports = { protect, optionalAuth };
