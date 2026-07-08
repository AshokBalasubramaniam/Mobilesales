const crypto = require('crypto');

const generateNumericOTP = (length = 6) => {
  const max = 10 ** length;
  const num = crypto.randomInt(0, max);
  return num.toString().padStart(length, '0');
};

const generateToken = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

module.exports = { generateNumericOTP, generateToken, hashToken };
