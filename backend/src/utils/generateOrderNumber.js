const crypto = require('crypto');

const generateOrderNumber = () => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `ORD-${datePart}-${randomPart}`;
};

module.exports = generateOrderNumber;
