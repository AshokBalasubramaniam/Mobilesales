// Access token lives in memory only (never localStorage) so it can't be read
// by an XSS payload; the refresh token is a separate httpOnly cookie the
// browser sends automatically and JS never touches.
let accessToken = null;
let onUnauthorized = null;

export const getAccessToken = () => accessToken;
export const setAccessToken = (token) => {
  accessToken = token;
};
export const clearAccessToken = () => {
  accessToken = null;
};

export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};
export const notifyUnauthorized = () => onUnauthorized?.();
