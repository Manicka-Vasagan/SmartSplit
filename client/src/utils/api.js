// Axios instance pre-configured with the base API URL.
// Automatically attaches the JWT token from localStorage to every request header,
// and handles 401 responses by clearing auth state.

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('smartsplit_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('smartsplit_token');
      localStorage.removeItem('smartsplit_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
