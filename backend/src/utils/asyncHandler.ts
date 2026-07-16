import type { NextFunction, Request, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import type { ParsedQs } from 'qs';

type AsyncRouteHandler<Params = ParamsDictionary, ResBody = unknown, ReqBody = unknown, ReqQuery = ParsedQs> = (
  req: Request<Params, ResBody, ReqBody, ReqQuery>,
  res: Response<ResBody>,
  next: NextFunction
) => Promise<unknown>;

const asyncHandler = <Params = ParamsDictionary, ResBody = unknown, ReqBody = unknown, ReqQuery = ParsedQs>(
  fn: AsyncRouteHandler<Params, ResBody, ReqBody, ReqQuery>
) => (req: Request<Params, ResBody, ReqBody, ReqQuery>, res: Response<ResBody>, next: NextFunction): void => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
