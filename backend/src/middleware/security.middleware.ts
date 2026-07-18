import type { NextFunction, Request, Response } from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import xss from 'xss';

type Sanitizable = string | Sanitizable[] | { [key: string]: Sanitizable } | number | boolean | null | undefined;

const sanitizeValue = (value: Sanitizable): Sanitizable => {
  if (typeof value === 'string') return xss(value);
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === 'object') {
    return Object.keys(value).reduce<Record<string, Sanitizable>>((acc, key) => {
      acc[key] = sanitizeValue(value[key]);
      return acc;
    }, {});
  }
  return value;
};

export const xssSanitizer = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.params) req.params = sanitizeValue(req.params) as Record<string, string>;
  next();
};

export const mongoSanitizer = mongoSanitize({
  onSanitize: () => {},
});

export const hppMiddleware = hpp();
