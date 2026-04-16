import axios, { AxiosError } from 'axios';
import { ApiResponse } from '@/types';

/**
 * Get the API base URL from environment or use local /api endpoint
 */
const getBaseURL = (): string => {
  if (typeof window === 'undefined') {
    // Server-side
    return process.env.API_URL || 'http://localhost:3000/api';
  }
  // Client-side: use NEXT_PUBLIC_API_URL if backend is external, otherwise use local /api
  return process.env.NEXT_PUBLIC_API_URL || '/api';
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor: auto-attach JWT token from localStorage
 */
apiClient.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('pettypet_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // localStorage might not be available in SSR context
    console.warn('Could not access localStorage for token');
  }
  return config;
});

/**
 * Response interceptor: handle auth errors and log errors
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    try {
      // Handle 401 Unauthorized - redirect to login
      if (error.response?.status === 401) {
        localStorage.removeItem('pettypet_token');
        localStorage.removeItem('pettypet_user');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }

      // Log errors for debugging
      const errorMessage = error.response?.data?.error ||
        error.response?.statusText ||
        error.message ||
        'Unknown error';

      console.error('[API Error]', {
        status: error.response?.status,
        message: errorMessage,
        url: error.config?.url,
        method: error.config?.method,
      });
    } catch (e) {
      console.error('[API Error Handler Error]', e);
    }

    return Promise.reject(error);
  }
);

/**
 * API fetch wrapper with error handling
 */
export const apiCall = {
  get: async <T,>(url: string) => {
    try {
      const { data } = await apiClient.get<ApiResponse<T>>(url);
      return data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  post: async <T,>(url: string, payload: unknown) => {
    try {
      const { data } = await apiClient.post<ApiResponse<T>>(url, payload);
      return data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  put: async <T,>(url: string, payload: unknown) => {
    try {
      const { data } = await apiClient.put<ApiResponse<T>>(url, payload);
      return data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  delete: async <T,>(url: string) => {
    try {
      const { data } = await apiClient.delete<ApiResponse<T>>(url);
      return data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};

/**
 * Helper to handle API errors and return user-friendly messages
 */
function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const statusCode = error.response?.status;

    switch (statusCode) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Session expired. Please login again.';
      case 403:
        return 'You do not have permission to do this.';
      case 404:
        return 'Resource not found.';
      case 409:
        return 'This resource already exists.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return (error.response?.data as any)?.error || 'An error occurred. Please try again.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
}

/**
 * User-friendly error message helper
 */
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const statusCode = error.response?.status;

    switch (statusCode) {
      case 400:
        return 'Invalid input. Please check and try again.';
      case 401:
        return 'Authentication failed. Please login.';
      case 403:
        return 'Access denied.';
      case 404:
        return 'Not found.';
      case 409:
        return 'Resource already exists.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return (error.response?.data as any)?.error || 'Something went wrong.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
};
