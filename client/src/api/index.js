import axios from "axios";

// Determine the API URL based on environment
const getApiUrl = () => {
  // Default to development URL
  let apiUrl = "http://localhost:5009/api";

  // If REACT_APP_API_URL is defined in .env, use that
  if (process.env.REACT_APP_API_URL) {
    apiUrl = process.env.REACT_APP_API_URL;
  }

  console.log("Using API URL:", apiUrl);
  return apiUrl;
};

// Create axios instance with default config
const API = axios.create({
  baseURL: getApiUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // Set a reasonable timeout
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    // Log all outgoing requests in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `🚀 API Request: ${config.method.toUpperCase()} ${config.url}`,
        config.data || ""
      );
    }

    // Add auth token if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
API.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `✅ API Response: ${response.config.method.toUpperCase()} ${
          response.config.url
        }`,
        response.data
      );
    }
    return response;
  },
  (error) => {
    // Create a more detailed error object
    const enhancedError = {
      message: "An error occurred with the API request",
      originalError: error,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config,
    };

    // Log detailed error information
    console.error("❌ API Error:", {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    // Handle specific error cases
    if (error.response) {
      // The server responded with a status code outside the 2xx range
      console.error(
        `Server responded with error ${error.response.status}:`,
        error.response.data
      );

      // Handle 401 Unauthorized errors (token expired, etc.)
      if (error.response.status === 401) {
        localStorage.removeItem("token");
        // You might want to redirect to login page here
        // window.location.href = '/login';
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received from server:", error.request);
    } else {
      // Something happened in setting up the request
      console.error("Error setting up request:", error.message);
    }

    return Promise.reject(enhancedError);
  }
);

export default API;
