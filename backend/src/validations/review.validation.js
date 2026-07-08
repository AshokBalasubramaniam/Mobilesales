const Joi = require('joi');

const createReview = {
  body: Joi.object({
    orderId: Joi.string().hex().length(24).required(),
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().max(2000).allow('').optional(),
  }),
};

const sellerReply = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  body: Joi.object({ text: Joi.string().max(1000).required() }),
};

const idParam = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
};

module.exports = { createReview, sellerReply, idParam };
