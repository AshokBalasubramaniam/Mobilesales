const Joi = require('joi');

const startConversation = {
  body: Joi.object({
    recipientId: Joi.string().hex().length(24).required(),
    mobileId: Joi.string().hex().length(24).optional(),
    message: Joi.string().max(2000).optional(),
  }),
};

const sendTextMessage = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  body: Joi.object({ content: Joi.string().max(2000).required() }),
};

const sendOffer = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  body: Joi.object({ amount: Joi.number().min(1).required() }),
};

const respondOffer = {
  params: Joi.object({ id: Joi.string().hex().length(24).required(), messageId: Joi.string().hex().length(24).required() }),
  body: Joi.object({ status: Joi.string().valid('accepted', 'rejected', 'countered').required(), counterAmount: Joi.number().optional() }),
};

const sendLocation = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  body: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
    address: Joi.string().optional(),
  }),
};

const logCallEvent = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  body: Joi.object({
    event: Joi.string().valid('started', 'ended', 'missed', 'declined').required(),
    durationSeconds: Joi.number().min(0).optional(),
  }),
};

const idParam = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
};

module.exports = { startConversation, sendTextMessage, sendOffer, respondOffer, sendLocation, logCallEvent, idParam };
