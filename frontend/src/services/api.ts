import axios from 'axios';
import { getErrorMessage, handleAsyncError } from '../utils/errorHandler';

const api = axios.create({
  baseURL: 'http://localhost:8081/api', // This points to your Spring Boot backend
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Transform error using your error handler
    const errorMessage = getErrorMessage(error);
    // You can add logging here if needed
    console.error('API Error:', errorMessage, error);
    return Promise.reject({ ...error, userMessage: errorMessage });
  }
);

export const apiCall = async (asyncFn: () => Promise<any>) => {
  return handleAsyncError(asyncFn);
};

export const apiService = {
  // GET request
  get: async (endpoint: string, params?: any) => {
    return apiCall(() => api.get(endpoint, { params }));
  },
  
  // POST request
  post: async (endpoint: string, data?: any) => {
    return apiCall(() => api.post(endpoint, data));
  },
  
  // PUT request
  put: async (endpoint: string, data?: any) => {
    return apiCall(() => api.put(endpoint, data));
  },
  
  // PATCH request
  patch: async (endpoint: string, data?: any) => {
    return apiCall(() => api.patch(endpoint, data));
  },
  
  // DELETE request
  delete: async (endpoint: string) => {
    return apiCall(() => api.delete(endpoint));
  },
};

export default api;