import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api/auth', // your backend base URL
});

// Add a request interceptor to inject token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
