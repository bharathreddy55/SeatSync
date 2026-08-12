import axios from 'axios';

let rawBaseURL = import.meta.env.VITE_API_BASE_URL || '';

// Normalize common invalid configuration string fallbacks
if (rawBaseURL === 'undefined' || rawBaseURL === 'null' || !rawBaseURL.trim()) {
  rawBaseURL = '';
}

// If baseURL is a domain/host missing a protocol scheme, prepend the appropriate one
if (rawBaseURL && !rawBaseURL.startsWith('http://') && !rawBaseURL.startsWith('https://') && !rawBaseURL.startsWith('/')) {
  if (rawBaseURL.includes('localhost') || rawBaseURL.includes('127.0.0.1')) {
    rawBaseURL = `http://${rawBaseURL}`;
  } else {
    rawBaseURL = `https://${rawBaseURL}`;
  }
}

const api = axios.create({
  baseURL: rawBaseURL,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        // Call refresh endpoint
        const response = await axios.post('/api/auth/refresh', { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Clear local storage and redirect to login if refresh fails
        localStorage.clear();
        // Don't force redirect immediately if we are already on login/register page
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = (err: any, fallback: string = 'An error occurred'): string => {
  if (err.response?.data) {
    const data = err.response.data;
    if (typeof data === 'object') {
      if (data.error) {
        return data.error;
      }
      if (data.message) {
        return data.message;
      }
      // Check for validation error map: { field: message }
      const messages = Object.entries(data)
        .map(([_, msg]) => `${msg}`)
        .join(', ');
      if (messages) {
        return messages;
      }
    } else if (typeof data === 'string') {
      return data;
    }
  }
  return err.message || fallback;
};

export default api;
