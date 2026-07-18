import Joi from 'joi';
import type { ValidationSchema } from '../middleware/validate.middleware';

export const createPaymentOrder: ValidationSchema = {
  body: Joi.object({
    orderId: Joi.string().hex().length(24).required(),
  }),
};

export const verifyPayment: ValidationSchema = {
  body: Joi.object({
    orderId: Joi.string().hex().length(24).required(),
    razorpay_order_id: Joi.string().required(),
    razorpay_payment_id: Joi.string().required(),
    razorpay_signature: Joi.string().required(),
  }),
};

export const refund: ValidationSchema = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  body: Joi.object({ reason: Joi.string().required() }),
};
