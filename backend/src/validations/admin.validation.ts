import Joi from 'joi';
import type { ValidationSchema } from '../middleware/validate.middleware';

export const updateSettings: ValidationSchema = {
  body: Joi.object({
    emailFrom: Joi.string().trim().email({ tlds: { allow: false } }).required(),
  }),
};
