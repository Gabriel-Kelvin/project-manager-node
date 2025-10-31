import api from './authService';

export const dashboardService = {
  // Get dashboard statistics
  async getDashboardStats() {
    try {
      const [leadsResponse, dealsResponse, tasksResponse] = await Promise.all([
        api.get('/leads/stats'),
        api.get('/deals/stats'),
        api.get('/tasks/stats')
      ]);

      return {
        success: true,
        data: {
          leads: leadsResponse.data,
          deals: dealsResponse.data,
          tasks: tasksResponse.data
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch dashboard statistics'
      };
    }
  },

  // Get recent activities
  async getRecentActivities(limit = 10) {
    try {
      const response = await api.get(`/activity/recent?limit=${limit}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch recent activities'
      };
    }
  },

  // Get monthly revenue data for charts
  async getMonthlyRevenue(months = 12) {
    try {
      // This would typically come from a dedicated analytics endpoint
      // For now, we'll simulate with deals data
      const response = await api.get('/deals/stats');
      
      // Generate mock monthly data based on deals
      const monthlyData = this.generateMonthlyRevenueData(months);
      
      return {
        success: true,
        data: monthlyData
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch revenue data'
      };
    }
  },

  // Generate mock monthly revenue data
  generateMonthlyRevenueData(months) {
    const data = [];
    const currentDate = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      
      // Generate realistic revenue data with some variation
      const baseRevenue = 50000 + Math.random() * 100000;
      const revenue = Math.round(baseRevenue);
      
      data.push({
        month: monthName,
        year: year,
        revenue: revenue,
        deals: Math.floor(Math.random() * 20) + 5,
        leads: Math.floor(Math.random() * 50) + 20
      });
    }
    
    return data;
  },

  // Get leads summary
  async getLeadsSummary() {
    try {
      const response = await api.get('/leads/stats');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch leads summary'
      };
    }
  },

  // Get deals summary
  async getDealsSummary() {
    try {
      const response = await api.get('/deals/stats');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch deals summary'
      };
    }
  },

  // Get tasks summary
  async getTasksSummary() {
    try {
      const response = await api.get('/tasks/stats');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch tasks summary'
      };
    }
  }
};

export default dashboardService;
