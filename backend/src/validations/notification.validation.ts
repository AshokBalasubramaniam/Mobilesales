import Joi from 'joi';
import type { ValidationSchema } from '../middleware/validate.middleware';

export const idParam: ValidationSchema = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
};
