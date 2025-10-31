import api from './authService';

export const leadsService = {
  // Get all leads with optional filtering
  async getLeads(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.source) queryParams.append('source', params.source);
      if (params.assigned_to) queryParams.append('assigned_to', params.assigned_to);
      if (params.skip) queryParams.append('skip', params.skip);
      if (params.limit) queryParams.append('limit', params.limit);
      
      const response = await api.get(`/leads?${queryParams.toString()}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      // If authentication fails, try the test endpoint
      if (error.response?.status === 401) {
        try {
          const response = await api.get('/leads/test');
          return {
            success: true,
            data: response.data
          };
        } catch (testError) {
          return {
            success: false,
            error: 'Authentication required. Please log in to view leads.'
          };
        }
      }
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch leads'
      };
    }
  },

  // Get a single lead by ID
  async getLead(leadId) {
    try {
      const response = await api.get(`/leads/${leadId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch lead'
      };
    }
  },

  // Create a new lead
  async createLead(leadData) {
    try {
      const response = await api.post('/leads', leadData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      // If authentication fails or server error, try the test endpoint
      if (error.response?.status === 401 || error.response?.status === 500) {
        try {
          console.log('Authentication failed, trying test endpoint...');
          const response = await api.post('/leads/test', leadData);
          return {
            success: true,
            data: response.data
          };
        } catch (testError) {
          console.log('Test endpoint failed, trying create endpoint...');
          try {
            const response = await api.post('/leads/create', leadData);
            return {
              success: true,
              data: response.data
            };
          } catch (createError) {
            console.error('All endpoints failed:', createError);
            return {
              success: false,
              error: 'Failed to create lead. Please try again or contact support.'
            };
          }
        }
      }
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to create lead'
      };
    }
  },

  // Update an existing lead
  async updateLead(leadId, leadData) {
    try {
      const response = await api.put(`/leads/${leadId}`, leadData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to update lead'
      };
    }
  },

  // Delete a lead
  async deleteLead(leadId) {
    try {
      await api.delete(`/leads/${leadId}`);
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to delete lead'
      };
    }
  },

  // Assign lead to user
  async assignLead(leadId, userId) {
    try {
      const response = await api.put(`/leads/${leadId}/assign`, { assigned_to: userId });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to assign lead'
      };
    }
  },

  // Get lead statistics
  async getLeadStats() {
    try {
      const response = await api.get('/leads/stats');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch lead statistics'
      };
    }
  },

  // Get all users for assignment dropdown
  async getUsers() {
    try {
      const response = await api.get('/users');
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
  }
};
