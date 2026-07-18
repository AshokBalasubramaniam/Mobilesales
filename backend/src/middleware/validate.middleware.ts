import type { NextFunction, Request, Response } from 'express';
import type { ObjectSchema } from 'joi';
import ApiError from '../utils/ApiError';

export interface ValidationSchema {
  body?: ObjectSchema;
  query?: ObjectSchema;
  params?: ObjectSchema;
}

type ValidationTarget = 'body' | 'query' | 'params';

const validate = (schema: ValidationSchema) => (req: Request, _res: Response, next: NextFunction): void => {
  const toValidate: Record<ValidationTarget, unknown> = {
    body: req.body,
    query: req.query,
    params: req.params,
  };

  const targets: ValidationTarget[] = ['body', 'query', 'params'];
  const errors: string[] = [];

  targets.forEach((key) => {
    const targetSchema = schema[key];
    if (!targetSchema) return;

    const { error, value } = targetSchema.validate(toValidate[key], {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      errors.push(...error.details.map((d) => d.message));
    } else if (key === 'body') {
      req.body = value;
    } else if (key === 'query') {
      req.query = value;
    } else {
      req.params = value;
    }
  });

  if (errors.length) {
    return next(ApiError.badRequest('Validation failed', errors));
  }
  next();
};

export default validate;
