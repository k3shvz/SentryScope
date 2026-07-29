import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('sentryscope_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // localStorage may be unavailable in some environments
  }
  return config;
});

export default api;