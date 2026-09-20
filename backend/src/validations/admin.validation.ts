import Joi from 'joi';
import type { ValidationSchema } from '../middleware/validate.middleware';

export const updateSettings: ValidationSchema = {
  body: Joi.object({
    emailFrom: Joi.string().trim().email({ tlds: { allow: false } }).optional(),
    heroBannerUrl: Joi.string().uri().allow('').optional(),
    heroBannerSize: Joi.number().integer().min(20).max(1000).optional(),
  }),
};
