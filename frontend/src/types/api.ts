// Mirrors backend/src/utils/ApiResponse.js and pagination.js response envelopes.

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T = null> {
  success: boolean;
  statusCode: number;
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
