/** Replaces the given keys of T with the populated shape in P (e.g. Populated<IOrder, { buyer: IUser }>). */
export type Populated<T, P extends Partial<Record<keyof T, unknown>>> = Omit<T, keyof P> & P;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginationDefaults {
  limit?: number;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}
