// Access token lives in memory only (never localStorage) so it can't be read
// by an XSS payload; the refresh token is a separate httpOnly cookie the
// browser sends automatically and JS never touches.
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
