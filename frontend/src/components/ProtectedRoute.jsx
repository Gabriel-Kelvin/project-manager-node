import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

// Basic protected route - requires authentication
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
};

// Role-based protected route - requires specific role
const RoleProtectedRoute = ({ children, requiredRoles = [], fallbackPath = "/dashboard" }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Check if user has required role
  if (requiredRoles.length > 0 && !requiredRoles.includes(user?.role)) {
    return <Navigate to={fallbackPath} replace />;
  }
  
  return children;
};

// Admin-only route
const AdminRoute = ({ children }) => {
  return (
    <RoleProtectedRoute requiredRoles={['admin']} fallbackPath="/dashboard">
      {children}
    </RoleProtectedRoute>
  );
};

// Manager or Admin route
const ManagerRoute = ({ children }) => {
  return (
    <RoleProtectedRoute requiredRoles={['manager', 'admin']} fallbackPath="/dashboard">
      {children}
    </RoleProtectedRoute>
  );
};

// Public route - redirects authenticated users
const PublicRoute = ({ children, redirectTo = "/dashboard" }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  
  return children;
};

// Conditional route - shows different content based on role
const ConditionalRoute = ({ children, userRole, adminContent, managerContent, userContent }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Determine which content to show based on user role
  let content = userContent; // default
  
  if (user?.role === 'admin' && adminContent) {
    content = adminContent;
  } else if (user?.role === 'manager' && managerContent) {
    content = managerContent;
  } else if (user?.role === 'user' && userContent) {
    content = userContent;
  }
  
  return content;
};

// Higher-order component for role-based access
const withRoleProtection = (WrappedComponent, requiredRoles = []) => {
  return (props) => {
    return (
      <RoleProtectedRoute requiredRoles={requiredRoles}>
        <WrappedComponent {...props} />
      </RoleProtectedRoute>
    );
  };
};

// Hook for checking permissions
const usePermissions = () => {
  const { user } = useAuth();
  
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
  
  return {
    hasRole,
    hasAnyRole,
    isAdmin,
    isManager,
    isUser,
    canManageUsers,
    canViewReports,
    canAssignTasks,
    canDeleteRecords,
    userRole: user?.role
  };
};

export {
  ProtectedRoute,
  RoleProtectedRoute,
  AdminRoute,
  ManagerRoute,
  PublicRoute,
  ConditionalRoute,
  withRoleProtection,
  usePermissions,
  LoadingSpinner
};
