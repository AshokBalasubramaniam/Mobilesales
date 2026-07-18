// Mirrors the backend's plain `res.status(code).json({ flag, message, data, meta })` envelope.

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T = null> {
  flag: "success" | "error";
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorPayload {
  message: string;
  [key: string]: unknown;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  [key: string]: unknown;
}
