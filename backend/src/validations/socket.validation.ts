import Joi from 'joi';

const conversationId = Joi.string().hex().length(24).required();
const userId = Joi.string().hex().length(24).required();

export const conversationIdSchema = conversationId;

export const typingSchema = Joi.object({ conversationId });

export const messageReadSchema = Joi.object({ conversationId });

export const callInviteSchema = Joi.object({
  conversationId,
  toUserId: userId,
  sdp: Joi.any().required(),
});

export const callAnswerSchema = Joi.object({
  toUserId: userId,
  sdp: Joi.any().required(),
});

export const callIceCandidateSchema = Joi.object({
  toUserId: userId,
  candidate: Joi.any().required(),
});

export const callEndSchema = Joi.object({
  toUserId: userId,
  conversationId,
});
