import axios from 'axios';
import { env } from '../config/env';
import { getAccessToken, setAccessToken, clearAccessToken, notifyUnauthorized } from './tokenManager';

const axiosClient = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
});

axiosClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise = null;

const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${env.apiUrl}/auth/refresh-token`, {}, { withCredentials: true })
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

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const isAuthRoute = config?.url?.includes('/auth/login') || config?.url?.includes('/auth/refresh-token');

    if (response?.status === 401 && !config._retried && !isAuthRoute) {
      config._retried = true;
      try {
        const token = await refreshAccessToken();
        config.headers.Authorization = `Bearer ${token}`;
        return axiosClient(config);
      } catch (refreshError) {
        clearAccessToken();
        notifyUnauthorized();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
