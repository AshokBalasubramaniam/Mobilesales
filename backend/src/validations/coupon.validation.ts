import Joi from 'joi';
import { COUPON_DISCOUNT_TYPE } from '../config/constants';
import type { ValidationSchema } from '../middleware/validate.middleware';

const createCouponBody = Joi.object({
  code: Joi.string().min(3).max(20).required(),
  description: Joi.string().allow('').optional(),
  discountType: Joi.string().valid(...Object.values(COUPON_DISCOUNT_TYPE)).required(),
  discountValue: Joi.number().min(1).required(),
  minOrderValue: Joi.number().min(0).default(0),
  maxDiscountAmount: Joi.number().min(0).optional(),
  usageLimit: Joi.number().min(1).optional(),
  perUserLimit: Joi.number().min(1).default(1),
  validFrom: Joi.date().optional(),
  validUntil: Joi.date().required(),
  applicableFor: Joi.string().valid('all', 'new_users').default('all'),
});

export const createCoupon: ValidationSchema = {
  body: createCouponBody,
};

export const updateCoupon: ValidationSchema = {
  body: createCouponBody.fork(Object.keys(createCouponBody.describe().keys), (schema) => schema.optional()),
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
};

export const applyCoupon: ValidationSchema = {
  body: Joi.object({
    code: Joi.string().required(),
    orderAmount: Joi.number().min(0).required(),
  }),
};

export const idParam: ValidationSchema = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
};
