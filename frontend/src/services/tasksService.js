import api from './authService';

export const tasksService = {
  // Get all tasks with optional filtering
  async getTasks(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.type) queryParams.append('type', params.type);
      if (params.assigned_to) queryParams.append('assigned_to', params.assigned_to);
      if (params.lead_id) queryParams.append('lead_id', params.lead_id);
      if (params.include_lead) queryParams.append('include_lead', params.include_lead);
      if (params.skip) queryParams.append('skip', params.skip);
      if (params.limit) queryParams.append('limit', params.limit);
      
      const response = await api.get(`/tasks?${queryParams.toString()}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      // If authentication fails, try the test endpoint
      if (error.response?.status === 401) {
        try {
          const response = await api.get('/tasks/test');
          return {
            success: true,
            data: response.data
          };
        } catch (testError) {
          return {
            success: false,
            error: 'Authentication required. Please log in to view tasks.'
          };
        }
      }
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch tasks'
      };
    }
  },

  // Get a single task by ID
  async getTask(taskId) {
    try {
      const response = await api.get(`/tasks/${taskId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch task'
      };
    }
  },

  // Create a new task
  async createTask(taskData) {
    try {
      const response = await api.post('/tasks', taskData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to create task'
      };
    }
  },

  // Update an existing task
  async updateTask(taskId, taskData) {
    try {
      const response = await api.put(`/tasks/${taskId}`, taskData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to update task'
      };
    }
  },

  // Delete a task
  async deleteTask(taskId) {
    try {
      await api.delete(`/tasks/${taskId}`);
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to delete task'
      };
    }
  },

  // Assign task to user
  async assignTask(taskId, userId) {
    try {
      const response = await api.put(`/tasks/${taskId}/assign`, { assigned_to: userId });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to assign task'
      };
    }
  },

  // Get upcoming tasks (due in next 7 days)
  async getUpcomingTasks(days = 7) {
    try {
      const response = await api.get(`/tasks/upcoming?days=${days}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch upcoming tasks'
      };
    }
  },

  // Get task statistics
  async getTaskStats() {
    try {
      const response = await api.get('/tasks/stats');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch task statistics'
      };
    }
  },

  // Get tasks by lead ID
  async getTasksByLead(leadId) {
    try {
      const response = await api.get(`/tasks/lead/${leadId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch tasks for lead'
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

  // Get all leads for task creation
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
