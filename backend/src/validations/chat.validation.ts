import Joi from 'joi';
import type { ValidationSchema } from '../middleware/validate.middleware';

export const startConversation: ValidationSchema = {
  body: Joi.object({
    recipientId: Joi.string().hex().length(24).required(),
    mobileId: Joi.string().hex().length(24).optional(),
    message: Joi.string().max(2000).optional(),
  }),
};

export const sendTextMessage: ValidationSchema = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  body: Joi.object({ content: Joi.string().max(2000).required() }),
};

export const sendOffer: ValidationSchema = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  body: Joi.object({ amount: Joi.number().min(1).required() }),
};

export const respondOffer: ValidationSchema = {
  params: Joi.object({ id: Joi.string().hex().length(24).required(), messageId: Joi.string().hex().length(24).required() }),
  body: Joi.object({ status: Joi.string().valid('accepted', 'rejected', 'countered').required(), counterAmount: Joi.number().optional() }),
};

export const sendLocation: ValidationSchema = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  body: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
    address: Joi.string().optional(),
  }),
};

export const logCallEvent: ValidationSchema = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  body: Joi.object({
    event: Joi.string().valid('started', 'ended', 'missed', 'declined').required(),
    durationSeconds: Joi.number().min(0).optional(),
  }),
};

export const idParam: ValidationSchema = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
};
