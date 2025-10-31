import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: import.meta.env.VITE_API_TIMEOUT || 10000,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Don't redirect immediately, let the app handle routing
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Login user
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      
      const { access_token, user_id, email: userEmail, full_name } = response.data;
      
      // Store token and user info in localStorage
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify({
        id: user_id,
        email: userEmail,
        full_name,
      }));
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed. Please try again.',
      };
    }
  },

  // Register user
  async signup(email, password, full_name) {
    try {
      const response = await api.post('/auth/signup', {
        email,
        password,
        full_name,
      });
      
      const { access_token, user_id, email: userEmail, full_name: userName } = response.data;
      
      // Store token and user info in localStorage
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify({
        id: user_id,
        email: userEmail,
        full_name: userName,
      }));
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Registration failed. Please try again.',
      };
    }
  },

  // Get current user info
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to get user info',
      };
    }
  },

  // Logout user
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Don't redirect immediately, let the app handle routing
  },

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Get stored user info
  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get stored token
  getToken() {
    return localStorage.getItem('token');
  },
};

export default api;
