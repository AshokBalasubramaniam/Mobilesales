import Joi from 'joi';
import { MOBILE_CONDITION, DEVICE_CATEGORY, MOBILE_STATUS, STORAGE_RAM_CATEGORIES, BATTERY_HEALTH_CATEGORIES } from '../config/constants';
import type { ValidationSchema } from '../middleware/validate.middleware';

const location = Joi.object({
  state: Joi.string().required(),
  city: Joi.string().required(),
  pincode: Joi.string().pattern(/^\d{6}$/).required(),
  lat: Joi.number().min(-90).max(90).optional(),
  lng: Joi.number().min(-180).max(180).optional(),
});

const createListingBody = Joi.object({
  category: Joi.string().valid(...Object.values(DEVICE_CATEGORY)).required(),
  attributes: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
  brand: Joi.string().required(),
  model: Joi.string().required(),
  color: Joi.string().optional(),
  storage: Joi.number()
    .min(1)
    .when('category', {
      is: Joi.string().valid(...STORAGE_RAM_CATEGORIES),
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  ram: Joi.number()
    .min(1)
    .when('category', {
      is: Joi.string().valid(...STORAGE_RAM_CATEGORIES),
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  condition: Joi.string().valid(...Object.values(MOBILE_CONDITION)).required(),
  batteryHealth: Joi.number()
    .min(0)
    .max(100)
    .when('category', {
      is: Joi.string().valid(...BATTERY_HEALTH_CATEGORIES),
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
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
    category: Joi.string().valid(...Object.values(DEVICE_CATEGORY)).optional(),
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

export const adminListQuery: ValidationSchema = {
  query: Joi.object({
    status: Joi.string().valid(...Object.values(MOBILE_STATUS)).optional(),
    category: Joi.string().valid(...Object.values(DEVICE_CATEGORY)).optional(),
    seller: Joi.string().hex().length(24).optional(),
    q: Joi.string().optional(),
    sort: Joi.string().valid('newest', 'price_asc', 'price_desc').optional(),
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).max(100).optional(),
  }),
};

export const idParam: ValidationSchema = {
  params: Joi.object({ id: Joi.string().hex().length(24).required() }),
};

export const homeSectionsQuery: ValidationSchema = {
  query: Joi.object({
    category: Joi.string().valid(...Object.values(DEVICE_CATEGORY)).optional(),
  }),
};

export const aiPriceSuggestion: ValidationSchema = {
  body: Joi.object({
    category: Joi.string().valid(...Object.values(DEVICE_CATEGORY)).required(),
    brand: Joi.string().required(),
    model: Joi.string().required(),
    storage: Joi.number().optional(),
    ram: Joi.number().optional(),
    condition: Joi.string().valid(...Object.values(MOBILE_CONDITION)).required(),
    batteryHealth: Joi.number().min(0).max(100).optional(),
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
