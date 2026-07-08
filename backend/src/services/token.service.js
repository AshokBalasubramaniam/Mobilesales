const jwt = require('jsonwebtoken');
const env = require('../config/env');

const msFromExpiresIn = (expiresIn) => {
  const match = /^(\d+)([smhd])$/.exec(expiresIn);
  if (!match) return 15 * 60 * 1000;
  const value = parseInt(match[1], 10);
  const unit = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[match[2]];
  return value * unit;
};

const issueTokenPair = (user) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  const refreshExpiresAt = new Date(Date.now() + msFromExpiresIn(env.jwt.refreshExpiresIn));
  return { accessToken, refreshToken, refreshExpiresAt };
};

const verifyRefreshToken = (token) => jwt.verify(token, env.jwt.refreshSecret);

module.exports = { issueTokenPair, verifyRefreshToken, msFromExpiresIn };
