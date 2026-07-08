export const env = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  socketUrl: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
};
