const Joi = require('joi');
const { REPORT_TYPE, REPORT_STATUS } = require('../config/constants');

const createReport = {
  body: Joi.object({
    reportType: Joi.string().valid(...Object.values(REPORT_TYPE)).required(),
    targetId: Joi.string().hex().length(24).required(),
    reason: Joi.string().required(),
    description: Joi.string().max(2000).allow('').optional(),
  }),
};

const resolveReport = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  body: Joi.object({
    status: Joi.string().valid(...Object.values(REPORT_STATUS)).required(),
    adminNote: Joi.string().allow('').optional(),
  }),
};

const createDispute = {
  body: Joi.object({
    orderId: Joi.string().hex().length(24).required(),
    reason: Joi.string().required(),
    description: Joi.string().max(3000).allow('').optional(),
  }),
};

const resolveDispute = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  body: Joi.object({
    status: Joi.string().valid('resolved', 'rejected', 'in_review').required(),
    resolution: Joi.string().allow('').optional(),
  }),
};

const idParam = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
};

module.exports = { createReport, resolveReport, createDispute, resolveDispute, idParam };
