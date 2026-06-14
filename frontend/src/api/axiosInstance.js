import axios from 'axios';

const axiosInstance = axios.create({
  // baseURL: import.meta.env.VITE_API_URL,
  baseURL: 'http://127.0.0.1:8000',   
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request automatically
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auto refresh token on 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem('refresh_token');
        // const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/token/refresh/`, {
        const res = await axios.post('http://127.0.0.1:8000/api/auth/token/refresh/', {
          refresh,
        });
        localStorage.setItem('access_token', res.data.access);
        original.headers.Authorization = `Bearer ${res.data.access}`;
        return axiosInstance(original);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;