import type { Response } from 'express';

export default class ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  meta?: unknown;

  constructor(statusCode: number, data: T | null = null, message = 'Success', meta: unknown = undefined) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    if (meta) this.meta = meta;
  }

  send(res: Response): Response {
    return res.status(this.statusCode).json(this);
  }
}
