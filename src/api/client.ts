import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import type { ApiError } from './types';

/**
 * Create and configure the Axios instance
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to add authentication token
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage (adjust based on your auth strategy)
    const token = localStorage.getItem('auth_token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log requests in development mode
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
      });
    }

    return config;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error('[API Request Error]', error);
    }
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle errors consistently
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log responses in development mode
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  (error: AxiosError) => {
    // Transform error into consistent format
    const apiError: ApiError = {
      message: 'An unexpected error occurred',
      status: error.response?.status,
      code: error.code,
      details: error.response?.data,
    };

    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      const responseData = error.response.data as { message?: string };
      apiError.message = responseData?.message || error.message;
      
      // Handle 401 Unauthorized - could redirect to login
      if (error.response.status === 401) {
        apiError.message = 'Unauthorized. Please log in again.';
        // Optional: Clear token and redirect to login
        // localStorage.removeItem('auth_token');
        // window.location.href = '/login';
      }
    } else if (error.request) {
      // Request made but no response received
      apiError.message = 'Network error. Please check your connection.';
    }

    // Log errors in development mode
    if (import.meta.env.DEV) {
      console.error('[API Error]', {
        message: apiError.message,
        status: apiError.status,
        code: apiError.code,
        details: apiError.details,
      });
    }

    return Promise.reject(apiError);
  }
);

export default apiClient;
