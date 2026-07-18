import Joi from 'joi';
import { VERIFICATION_STATUS } from '../config/constants';
import type { ValidationSchema } from '../middleware/validate.middleware';

export const updateProfile: ValidationSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    phone: Joi.string().pattern(/^[6-9]\d{9}$/).optional(),
  }),
};

export const addAddress: ValidationSchema = {
  body: Joi.object({
    label: Joi.string().default('Home'),
    line1: Joi.string().required(),
    line2: Joi.string().allow('').optional(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    pincode: Joi.string().pattern(/^\d{6}$/).required(),
    isDefault: Joi.boolean().default(false),
  }),
};

export const idParam: ValidationSchema = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
};

export const blockUser: ValidationSchema = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  body: Joi.object({ reason: Joi.string().required() }),
};

export const reviewSellerVerification: ValidationSchema = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  body: Joi.object({
    status: Joi.string().valid(VERIFICATION_STATUS.APPROVED, VERIFICATION_STATUS.REJECTED).required(),
    rejectionReason: Joi.string().when('status', { is: VERIFICATION_STATUS.REJECTED, then: Joi.required(), otherwise: Joi.optional() }),
  }),
};

export const addressIdParam: ValidationSchema = {
  params: Joi.object({ addressId: Joi.string().hex().length(24).required() }),
};
