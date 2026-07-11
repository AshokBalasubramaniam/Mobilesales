// Default to a relative path rather than an absolute localhost URL: this
// works correctly in both contexts without needing VITE_API_URL to be set
// at all — local dev proxies /api to the backend via vite.config.js, and
// production proxies /api to the backend via Netlify's _redirects. An
// absolute default would silently break production if the build ever
// fails to pick up the env var (which is exactly what caused the
// cross-domain-cookie logout bug).
export const env = {
  apiUrl: import.meta.env.VITE_API_URL || '/api',
  socketUrl: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
};
