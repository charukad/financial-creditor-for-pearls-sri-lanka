// src/api/index.js
import axios from "axios";

// Create an axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5009/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to attach the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common response issues
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized errors (expired token, etc.)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
