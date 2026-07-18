import Joi from 'joi';
import { REPORT_TYPE, REPORT_STATUS } from '../config/constants';
import type { ValidationSchema } from '../middleware/validate.middleware';

export const createReport: ValidationSchema = {
  body: Joi.object({
    reportType: Joi.string().valid(...Object.values(REPORT_TYPE)).required(),
    targetId: Joi.string().hex().length(24).required(),
    reason: Joi.string().required(),
    description: Joi.string().max(2000).allow('').optional(),
  }),
};

export const resolveReport: ValidationSchema = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  body: Joi.object({
    status: Joi.string().valid(...Object.values(REPORT_STATUS)).required(),
    adminNote: Joi.string().allow('').optional(),
  }),
};

export const createDispute: ValidationSchema = {
  body: Joi.object({
    orderId: Joi.string().hex().length(24).required(),
    reason: Joi.string().required(),
    description: Joi.string().max(3000).allow('').optional(),
  }),
};

export const resolveDispute: ValidationSchema = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  body: Joi.object({
    status: Joi.string().valid('resolved', 'rejected', 'in_review').required(),
    resolution: Joi.string().allow('').optional(),
  }),
};

export const idParam: ValidationSchema = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
};
