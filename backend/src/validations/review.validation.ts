import Joi from 'joi';
import type { ValidationSchema } from '../middleware/validate.middleware';

export const createReview: ValidationSchema = {
  body: Joi.object({
    orderId: Joi.string().hex().length(24).required(),
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().max(2000).allow('').optional(),
  }),
};

export const sellerReply: ValidationSchema = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  body: Joi.object({ text: Joi.string().max(1000).required() }),
};

export const idParam: ValidationSchema = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
};
