import api from './authService';

export const usersService = {
  // Get all users with optional filtering
  async getUsers(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.search) queryParams.append('search', params.search);
      if (params.role) queryParams.append('role', params.role);
      if (params.is_active !== undefined) queryParams.append('is_active', params.is_active);
      if (params.skip) queryParams.append('skip', params.skip);
      if (params.limit) queryParams.append('limit', params.limit);
      
      const response = await api.get(`/users?${queryParams.toString()}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch users'
      };
    }
  },

  // Get a single user by ID
  async getUser(userId) {
    try {
      const response = await api.get(`/users/${userId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch user'
      };
    }
  },

  // Update user role
  async updateUserRole(userId, role) {
    try {
      const response = await api.put(`/users/${userId}/role`, { role });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to update user role'
      };
    }
  },

  // Deactivate user account
  async deactivateUser(userId) {
    try {
      const response = await api.put(`/users/${userId}/deactivate`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to deactivate user'
      };
    }
  },

  // Activate user account
  async activateUser(userId) {
    try {
      const response = await api.put(`/users/${userId}/activate`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to activate user'
      };
    }
  },

  // Delete user account (admin only)
  async deleteUser(userId) {
    try {
      await api.delete(`/users/${userId}`);
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to delete user'
      };
    }
  },

  // Get user statistics
  async getUserStats() {
    try {
      const response = await api.get('/users/stats');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch user statistics'
      };
    }
  },

  // Get current user profile
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch current user'
      };
    }
  }
};
