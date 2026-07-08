const Joi = require('joi');

const addToWishlist = {
  body: Joi.object({ mobileId: Joi.string().hex().length(24).required() }),
};

const mobileIdParam = {
  params: Joi.object({ mobileId: Joi.string().hex().length(24).required() }),
};

module.exports = { addToWishlist, mobileIdParam };
