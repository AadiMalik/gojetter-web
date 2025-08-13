// src/api/index.js
import axios from 'axios';
import { useAuthStore } from '@/store/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://admin.go-jetter.com/api', // use env variable
  headers: { 'Content-Type': 'application/json' }
});

// Attach token automatically to requests
api.interceptors.request.use(config => {
  const auth = useAuthStore();
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
}, error => Promise.reject(error));

export default api;
