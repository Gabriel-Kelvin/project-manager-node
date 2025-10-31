import api from './authService';

export const dealsService = {
  // Get all deals with optional filtering
  async getDeals(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.search) queryParams.append('search', params.search);
      if (params.stage) queryParams.append('stage', params.stage);
      if (params.assigned_to) queryParams.append('assigned_to', params.assigned_to);
      if (params.lead_id) queryParams.append('lead_id', params.lead_id);
      if (params.include_lead) queryParams.append('include_lead', params.include_lead);
      if (params.skip) queryParams.append('skip', params.skip);
      if (params.limit) queryParams.append('limit', params.limit);
      
      const response = await api.get(`/deals?${queryParams.toString()}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch deals'
      };
    }
  },

  // Get a single deal by ID
  async getDeal(dealId) {
    try {
      const response = await api.get(`/deals/${dealId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch deal'
      };
    }
  },

  // Create a new deal
  async createDeal(dealData) {
    try {
      const response = await api.post('/deals', dealData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to create deal'
      };
    }
  },

  // Update an existing deal
  async updateDeal(dealId, dealData) {
    try {
      const response = await api.put(`/deals/${dealId}`, dealData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to update deal'
      };
    }
  },

  // Delete a deal
  async deleteDeal(dealId) {
    try {
      await api.delete(`/deals/${dealId}`);
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to delete deal'
      };
    }
  },

  // Assign deal to user
  async assignDeal(dealId, userId) {
    try {
      const response = await api.put(`/deals/${dealId}/assign`, { assigned_to: userId });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to assign deal'
      };
    }
  },

  // Get deal statistics
  async getDealStats() {
    try {
      const response = await api.get('/deals/stats');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch deal statistics'
      };
    }
  },

  // Get deals by lead ID
  async getDealsByLead(leadId) {
    try {
      const response = await api.get(`/deals/lead/${leadId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch deals for lead'
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
  },

  // Get all leads for deal creation
  async getLeads() {
    try {
      const response = await api.get('/leads');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch leads'
      };
    }
  }
};
