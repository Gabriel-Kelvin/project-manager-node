import { create } from 'zustand';
import { auth as authApi } from '../services/api';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Initialize auth state from localStorage
  initialize: () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true });
        // Verify token is still valid
        get().verifyToken();
      } catch (error) {
        // Invalid stored data, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  },

  // Verify token with backend
  verifyToken: async () => {
    try {
      const data = await authApi.verify();
      set({ user: data, isAuthenticated: true, error: null });
      localStorage.setItem('user', JSON.stringify(data));
      return true;
    } catch (error) {
      // Token invalid, clear auth state
      get().logout();
      return false;
    }
  },

  // Signup new user
  signup: async (username, password, email) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authApi.signup(username, password, email);
      const { token, user } = data;
      
      // Store token and user
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({
        user,
        token: token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Signup failed';
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Login user
  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authApi.login(username, password);
      const { token, user } = data;
      
      // Store token and user
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({
        user,
        token: token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Login failed';
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Logout user
  logout: async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Continue logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Clear state
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
      });
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useAuthStore;

