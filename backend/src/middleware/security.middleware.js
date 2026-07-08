const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const xss = require('xss');

const sanitizeValue = (value) => {
  if (typeof value === 'string') return xss(value);
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === 'object') {
    return Object.keys(value).reduce((acc, key) => {
      acc[key] = sanitizeValue(value[key]);
      return acc;
    }, {});
  }
  return value;
};

const xssSanitizer = (req, res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.params) req.params = sanitizeValue(req.params);
  next();
};

const mongoSanitizer = mongoSanitize({
  onSanitize: () => {},
});

module.exports = { xssSanitizer, mongoSanitizer, hpp: hpp() };
