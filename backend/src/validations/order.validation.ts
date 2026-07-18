import Joi from 'joi';
import { DELIVERY_TYPE, DELIVERY_STATUS } from '../config/constants';
import type { ValidationSchema } from '../middleware/validate.middleware';

export const createOrder: ValidationSchema = {
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

export const updateTracking: ValidationSchema = {
  body: Joi.object({
    status: Joi.string().valid(...Object.values(DELIVERY_STATUS)).required(),
    location: Joi.string().optional(),
    note: Joi.string().optional(),
    trackingNumber: Joi.string().optional(),
    courierPartner: Joi.string().optional(),
  }),
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
};

export const cancelOrder: ValidationSchema = {
  body: Joi.object({ reason: Joi.string().required() }),
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
};

export const idParam: ValidationSchema = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
};
