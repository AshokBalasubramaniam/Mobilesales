
let accessToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export const getAccessToken = (): string | null => accessToken;
export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};
export const clearAccessToken = (): void => {
  accessToken = null;
};

export const setUnauthorizedHandler = (handler: () => void): void => {
  onUnauthorized = handler;
};
export const notifyUnauthorized = (): void => onUnauthorized?.();
