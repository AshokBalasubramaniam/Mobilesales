import axios, { type InternalAxiosRequestConfig } from "axios";
import { env } from "../config/env";
import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
  isAccessTokenExpiringSoon,
  notifyUnauthorized,
} from "./tokenManager";

declare module "axios" {
  export interface InternalAxiosRequestConfig {
    _retried?: boolean;
  }
}

const api = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
});

let refreshPromise: Promise<string> | null = null;

export const refreshAccessToken = (): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post<{ data: { accessToken: string } }>(
        `${env.apiUrl}/auth/refresh-token`,
        {},
        { withCredentials: true },
      )
      .then((res) => {
        const token = res.data.data.accessToken;
        setAccessToken(token);
        return token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

// Routes that only optionally use auth (e.g. viewing a listing) never come
// back 401 for an expired token — they silently treat the request as
// anonymous instead — so the response interceptor's reactive refresh below
// never gets a chance to fire for them. Refreshing proactively here, before
// the token actually expires, covers those routes too.
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (isAccessTokenExpiringSoon()) {
    try {
      await refreshAccessToken();
    } catch {
      // Let the request go out as-is; anything that truly requires auth
      // will 401 and hit the reactive refresh/logout path below.
    }
  }

  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const isAuthRoute =
      config?.url?.includes("/auth/login") ||
      config?.url?.includes("/auth/refresh-token");

    if (response?.status === 401 && !config?._retried && !isAuthRoute) {
      config._retried = true;
      try {
        const token = await refreshAccessToken();
        config.headers.Authorization = `Bearer ${token}`;
        return api(config);
      } catch (refreshError) {
        clearAccessToken();
        notifyUnauthorized();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
