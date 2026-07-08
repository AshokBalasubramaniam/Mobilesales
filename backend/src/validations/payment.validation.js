const Joi = require('joi');

const createPaymentOrder = {
  body: Joi.object({
    orderId: Joi.string().hex().length(24).required(),
  }),
};

const verifyPayment = {
  body: Joi.object({
    orderId: Joi.string().hex().length(24).required(),
    razorpay_order_id: Joi.string().required(),
    razorpay_payment_id: Joi.string().required(),
    razorpay_signature: Joi.string().required(),
  }),
};

const refund = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  body: Joi.object({ reason: Joi.string().required() }),
};

module.exports = { createPaymentOrder, verifyPayment, refund };
