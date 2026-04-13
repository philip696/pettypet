import axios, { AxiosError } from 'axios';
import { ApiResponse } from '@/types';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const apiCall = {
  get: async <T,>(url: string) => {
    const { data } = await apiClient.get<ApiResponse<T>>(url);
    return data;
  },
  post: async <T,>(url: string, payload: unknown) => {
    const { data } = await apiClient.post<ApiResponse<T>>(url, payload);
    return data;
  },
  put: async <T,>(url: string, payload: unknown) => {
    const { data } = await apiClient.put<ApiResponse<T>>(url, payload);
    return data;
  },
  delete: async <T,>(url: string) => {
    const { data } = await apiClient.delete<ApiResponse<T>>(url);
    return data;
  },
};
