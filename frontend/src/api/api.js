import axios from 'axios';

// Get base URL from environment or default to localhost
const getBaseURL = () => {
  if (import.meta.env.MODE === 'production') {
    return import.meta.env.VITE_API_URL || 'https://api.360proctor.com';
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:8000';
};

// Create axios instance with enhanced configuration
const api = axios.create({
  baseURL: `${getBaseURL()}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };

    return config;
  },
  error => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration and errors
api.interceptors.response.use(
  response => {
    // Calculate request duration for debugging
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;

    if (import.meta.env.MODE === 'development') {
      console.log(
        `API Request: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`
      );
    }

    return response;
  },
  error => {
    // Enhanced error handling
    if (error.response) {
      const { status, data } = error.response;

      // Handle 401 Unauthorized errors (token expired)
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }

      // Handle 403 Forbidden errors
      if (status === 403) {
        console.error('Access forbidden:', data?.detail || 'Insufficient permissions');
      }

      // Handle 404 Not Found errors
      if (status === 404) {
        console.error('Resource not found:', data?.detail || 'Resource not found');
      }

      // Handle 422 Validation errors
      if (status === 422) {
        console.error('Validation error:', data?.detail || 'Validation failed');
      }

      // Handle 500 Server errors
      if (status >= 500) {
        console.error('Server error:', data?.detail || 'Internal server error');
      }
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.message);
    } else {
      // Other error
      console.error('Request error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
