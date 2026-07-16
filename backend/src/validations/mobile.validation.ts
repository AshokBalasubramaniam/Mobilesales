import Joi from 'joi';
import { MOBILE_CONDITION } from '../config/constants';
import type { ValidationSchema } from '../middleware/validate.middleware';

const location = Joi.object({
  state: Joi.string().required(),
  city: Joi.string().required(),
  pincode: Joi.string().pattern(/^\d{6}$/).required(),
  lat: Joi.number().min(-90).max(90).optional(),
  lng: Joi.number().min(-180).max(180).optional(),
});

const createListingBody = Joi.object({
  brand: Joi.string().required(),
  model: Joi.string().required(),
  color: Joi.string().optional(),
  storage: Joi.number().min(1).required(),
  ram: Joi.number().min(1).required(),
  condition: Joi.string().valid(...Object.values(MOBILE_CONDITION)).required(),
  batteryHealth: Joi.number().min(0).max(100).required(),
  price: Joi.number().min(1).required(),
  mrp: Joi.number().min(1).optional(),
  negotiable: Joi.boolean().default(true),
  imei: Joi.string().pattern(/^\d{15}$/).optional(),
  warranty: Joi.object({
    hasWarranty: Joi.boolean().default(false),
    expiryDate: Joi.date().empty('').allow(null).optional(),
  }).optional(),
  repairHistory: Joi.array()
    .items(Joi.object({ issue: Joi.string().required(), date: Joi.date().optional(), description: Joi.string().optional() }))
    .optional(),
  originalBoxAvailable: Joi.boolean().default(false),
  chargerIncluded: Joi.boolean().default(false),
  accessoriesIncluded: Joi.array().items(Joi.string()).optional(),
  description: Joi.string().max(5000).optional(),
  location: location.required(),
});

export const createListing: ValidationSchema = {
  body: createListingBody,
};

export const updateListing: ValidationSchema = {
  body: createListingBody.fork(Object.keys(createListingBody.describe().keys), (schema) => schema.optional()),
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
};

export const listQuery: ValidationSchema = {
  query: Joi.object({
    brand: Joi.alternatives(Joi.string(), Joi.array().items(Joi.string())).optional(),
    model: Joi.string().optional(),
    q: Joi.string().optional(),
    minPrice: Joi.number().min(0).optional(),
    maxPrice: Joi.number().min(0).optional(),
    ram: Joi.alternatives(Joi.number(), Joi.array().items(Joi.number())).optional(),
    storage: Joi.alternatives(Joi.number(), Joi.array().items(Joi.number())).optional(),
    minBatteryHealth: Joi.number().min(0).max(100).optional(),
    condition: Joi.string().optional(),
    hasWarranty: Joi.boolean().optional(),
    verifiedSeller: Joi.boolean().optional(),
    verifiedImei: Joi.boolean().optional(),
    seller: Joi.string().hex().length(24).optional(),
    state: Joi.string().optional(),
    city: Joi.string().optional(),
    pincode: Joi.string().optional(),
    lat: Joi.number().optional(),
    lng: Joi.number().optional(),
    radiusKm: Joi.number().min(1).max(200).optional(),
    sort: Joi.string()
      .valid('newest', 'price_asc', 'price_desc', 'popular')
      .default('newest'),
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).max(100).optional(),
  }),
};

export const idParam: ValidationSchema = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
};

export const aiPriceSuggestion: ValidationSchema = {
  body: Joi.object({
    brand: Joi.string().required(),
    model: Joi.string().required(),
    storage: Joi.number().required(),
    ram: Joi.number().required(),
    condition: Joi.string().valid(...Object.values(MOBILE_CONDITION)).required(),
    batteryHealth: Joi.number().min(0).max(100).required(),
    mrp: Joi.number().optional(),
  }),
};

export const rejectListing: ValidationSchema = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  body: Joi.object({ reason: Joi.string().required() }),
};

export const verifyImei: ValidationSchema = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  body: Joi.object({ verified: Joi.boolean().required() }),
};
