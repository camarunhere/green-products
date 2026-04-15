import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api`,
  headers: { 'Content-Type': 'application/json' },
  maxBodyLength: 20 * 1024 * 1024,    // 20 MB — needed for base64 image uploads
  maxContentLength: 20 * 1024 * 1024, // 20 MB
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('gp_token');
      localStorage.removeItem('gp_user');
    }
    return Promise.reject(err);
  }
);

export default api;
