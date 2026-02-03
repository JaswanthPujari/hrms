import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://hrms-1-fmzs.onrender.com";
const API_URL = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
});

// Utility function to decode JWT token and check expiration
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // JWT tokens have 3 parts separated by dots: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    // Decode the payload (second part)
    const payload = JSON.parse(atob(parts[1]));
    
    // Check if token has expiration claim
    if (!payload.exp) return true;
    
    // exp is in seconds, Date.now() is in milliseconds
    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    
    // Return true if token is expired (with 5 second buffer to account for clock skew)
    return currentTime >= (expirationTime - 5000);
  } catch (error) {
    // If we can't decode the token, consider it expired
    return true;
  }
};

// Function to clear auth and redirect to login
export const logoutUser = () => {
  const currentPath = window.location.pathname;
  if (currentPath !== '/login' && !currentPath.startsWith('/login')) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.error('Your session has expired. Please log in again.');
    window.location.href = '/login';
  }
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Check if token is expired before making the request
      if (isTokenExpired(token)) {
        logoutUser();
        return Promise.reject(new Error('Token expired'));
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response?.status === 401) {
      // Only handle if not already on login page to avoid infinite redirects
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && !currentPath.startsWith('/login')) {
        // Clear authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Show user-friendly message
        toast.error('Your session has expired. Please log in again.');
        
        // Redirect to login page
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
