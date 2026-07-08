const Joi = require('joi');

const idParam = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
};

module.exports = { idParam };
