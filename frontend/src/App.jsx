import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { 
  ProtectedRoute, 
  AdminRoute, 
  ManagerRoute, 
  PublicRoute,
  LoadingSpinner 
} from './components/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Leads from './pages/Leads';
import Deals from './pages/Deals';
import Tasks from './pages/Tasks';
import Users from './pages/Users';

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/signup" 
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          } 
        />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/leads" 
          element={
            <ProtectedRoute>
              <Layout>
                <Leads />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/deals" 
          element={
            <ProtectedRoute>
              <Layout>
                <Deals />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tasks" 
          element={
            <ProtectedRoute>
              <Layout>
                <Tasks />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/users" 
          element={
            <AdminRoute>
              <Layout>
                <Users />
              </Layout>
            </AdminRoute>
          } 
        />
        
        {/* Default redirect */}
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
        />
        
        {/* Catch all route */}
        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
