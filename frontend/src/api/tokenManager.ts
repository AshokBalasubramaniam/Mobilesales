
let accessToken: string | null = null;
let accessTokenExpiresAt: number | null = null;
let onUnauthorized: (() => void) | null = null;

// Reads the JWT's `exp` claim (seconds since epoch) without a full JWT
// library — just enough to know when to proactively refresh.
const decodeJwtExpiresAt = (token: string): number | null => {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const { exp } = JSON.parse(json) as { exp?: number };
    return typeof exp === "number" ? exp * 1000 : null;
  } catch {
    return null;
  }
};

export const getAccessToken = (): string | null => accessToken;
export const setAccessToken = (token: string | null): void => {
  accessToken = token;
  accessTokenExpiresAt = token ? decodeJwtExpiresAt(token) : null;
};
export const clearAccessToken = (): void => {
  accessToken = null;
  accessTokenExpiresAt = null;
};

// Routes that only optionally use auth (e.g. viewing a listing) never
// return 401 for an expired token — they just silently treat the request
// as anonymous — so the response interceptor's reactive refresh never
// fires there. This lets the request interceptor refresh proactively
// instead of waiting for a 401 that will never come.
export const isAccessTokenExpiringSoon = (bufferMs = 5000): boolean =>
  accessToken !== null &&
  accessTokenExpiresAt !== null &&
  Date.now() >= accessTokenExpiresAt - bufferMs;

export const setUnauthorizedHandler = (handler: () => void): void => {
  onUnauthorized = handler;
};
export const notifyUnauthorized = (): void => onUnauthorized?.();
