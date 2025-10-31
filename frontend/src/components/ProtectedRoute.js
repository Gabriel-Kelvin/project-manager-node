import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Loading from './Loading';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, initialize, verifyToken } = useAuthStore();
  const [checking, setChecking] = React.useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Initialize auth from localStorage
      initialize();
      
      // Verify token if exists
      const token = localStorage.getItem('token');
      if (token) {
        await verifyToken();
      }
      
      setChecking(false);
    };

    checkAuth();
  }, [initialize, verifyToken]);

  if (checking || isLoading) {
    return <Loading fullScreen text="Verifying authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

