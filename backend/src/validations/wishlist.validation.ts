import Joi from 'joi';
import type { ValidationSchema } from '../middleware/validate.middleware';

export const addToWishlist: ValidationSchema = {
  body: Joi.object({ mobileId: Joi.string().hex().length(24).required() }),
};

export const mobileIdParam: ValidationSchema = {
  params: Joi.object({ mobileId: Joi.string().hex().length(24).required() }),
};
