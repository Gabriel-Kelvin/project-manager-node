import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on app load
    const checkAuth = async () => {
      try {
        const token = authService.getToken();
        const storedUser = authService.getStoredUser();
        
        if (token && storedUser) {
          // For now, just use stored user data without API verification
          // This prevents the app from failing when backend is not running
          setUser(storedUser);
          setIsAuthenticated(true);
          
          // Optionally verify token in background (non-blocking)
          try {
            const response = await authService.getCurrentUser();
            if (response.success) {
              setUser(response.data);
            } else {
              // Token is invalid, clear storage
              authService.logout();
              setUser(null);
              setIsAuthenticated(false);
            }
          } catch (verifyError) {
            // If verification fails, keep using stored data
            console.warn('Token verification failed, using stored data:', verifyError);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Don't clear storage on error, just set loading to false
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      if (response.success) {
        setUser(response.data);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email, password, full_name) => {
    setIsLoading(true);
    try {
      const response = await authService.signup(email, password, full_name);
      if (response.success) {
        setUser(response.data);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success) {
        setUser(response.data);
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      return { success: false, error: 'Failed to refresh user data' };
    }
  };

  const updateUserRole = (newRole) => {
    if (user) {
      setUser(prev => ({ ...prev, role: newRole }));
    }
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isManager = () => {
    return user?.role === 'manager';
  };

  const isUser = () => {
    return user?.role === 'user';
  };

  const canManageUsers = () => {
    return user?.role === 'admin';
  };

  const canViewReports = () => {
    return ['manager', 'admin'].includes(user?.role);
  };

  const canAssignTasks = () => {
    return ['manager', 'admin'].includes(user?.role);
  };

  const canDeleteRecords = () => {
    return ['manager', 'admin'].includes(user?.role);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    refreshUser,
    updateUserRole,
    hasRole,
    hasAnyRole,
    isAdmin,
    isManager,
    isUser,
    canManageUsers,
    canViewReports,
    canAssignTasks,
    canDeleteRecords,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
