import axios from 'axios';
import { API_URL } from '../config';
import { authService } from '../services/auth';
import { isTokenExpired } from '../utils/jwt';

// Simple type for axios config with _retry
type AxiosRequestConfigWithRetry = any & {
  _retry?: boolean;
};

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to handle token refresh and add auth token
axiosInstance.interceptors.request.use(
  async (config: AxiosRequestConfigWithRetry) => {
    // Skip token checks for authentication endpoints
    const authEndpoints = ['/auth/signin', '/auth/signup', '/auth/refresh'];
    const isAuthEndpoint = authEndpoints.some(endpoint => 
      config.url?.includes(endpoint)
    );

    if (isAuthEndpoint) {
      return config;
    }

    // Get current token
    const token = authService.getAccessToken();
    const refreshToken = authService.getRefreshToken();
    if (!token || !refreshToken) {
      return config;
    }

    // Check if token is expired or about to expire
    if (isTokenExpired(token)) {
      try {
        // Attempt to refresh token
        const newTokens = await authService.refreshToken();
        if (newTokens) {
          // Update the auth header with the new token
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${newTokens.access_token}`;
          
          // Update stored tokens
          authService.setTokens({
            access_token: newTokens.access_token,
            refresh_token: newTokens.refresh_token,
          });
        } else {
          // If refresh fails, clear tokens and redirect to sign-in
          authService.clearTokens();
          window.location.href = '/sign-in';
          return Promise.reject(new Error('Session expired. Please sign in again.'));
        }
      } catch (error) {
        // If refresh fails, clear tokens and redirect to sign-in
        authService.clearTokens();
        window.location.href = '/sign-in';
        return Promise.reject(error);
      }
    } else {
      // Token is still valid, add it to the request
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfigWithRetry;

    // If we get a 401 and this isn't a retry, it might be because our token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/refresh')) {
        authService.clearTokens();
        window.location.href = '/sign-in';
        return Promise.reject(new Error('Session expired. Please sign in again.'));
      }
    }
    
    // For all other errors, reject normally
    return Promise.reject(error);
  }
);

export default axiosInstance;
