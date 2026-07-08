const ApiError = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
  const toValidate = {
    body: req.body,
    query: req.query,
    params: req.params,
  };

  const activeSchema = {};
  ['body', 'query', 'params'].forEach((key) => {
    if (schema[key]) activeSchema[key] = schema[key];
  });

  const errors = [];
  Object.keys(activeSchema).forEach((key) => {
    const { error, value } = activeSchema[key].validate(toValidate[key], {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      errors.push(...error.details.map((d) => d.message));
    } else {
      req[key] = value;
    }
  });

  if (errors.length) {
    return next(ApiError.badRequest('Validation failed', errors));
  }
  next();
};

module.exports = validate;
