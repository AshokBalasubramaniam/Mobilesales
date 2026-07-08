const Joi = require('joi');
const { DELIVERY_TYPE, DELIVERY_STATUS } = require('../config/constants');

const createOrder = {
  body: Joi.object({
    mobileId: Joi.string().hex().length(24).required(),
    deliveryType: Joi.string().valid(...Object.values(DELIVERY_TYPE)).required(),
    deliveryAddress: Joi.object({
      line1: Joi.string().required(),
      line2: Joi.string().allow('').optional(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      pincode: Joi.string().pattern(/^\d{6}$/).required(),
    }).when('deliveryType', {
      is: Joi.valid(DELIVERY_TYPE.HOME_DELIVERY, DELIVERY_TYPE.LOCAL_DELIVERY),
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    couponCode: Joi.string().optional(),
  }),
};

const updateTracking = {
  body: Joi.object({
    status: Joi.string().valid(...Object.values(DELIVERY_STATUS)).required(),
    location: Joi.string().optional(),
    note: Joi.string().optional(),
    trackingNumber: Joi.string().optional(),
    courierPartner: Joi.string().optional(),
  }),
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
};

const cancelOrder = {
  body: Joi.object({ reason: Joi.string().required() }),
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
};

const idParam = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
};

module.exports = { createOrder, updateTracking, cancelOrder, idParam };
