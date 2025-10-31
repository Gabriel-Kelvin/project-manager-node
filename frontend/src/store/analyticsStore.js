import { create } from 'zustand';
import { analytics as analyticsApi } from '../services/api';
import { toast } from '../components/Toast';

const useAnalyticsStore = create((set, get) => ({
  projectAnalytics: null,
  timelineData: [],
  memberAnalytics: {},
  loading: false,
  error: null,
  selectedMetric: 'progress',
  dateRange: '30', // '7', '30', '90', 'all'
  lastUpdated: null,

  // Fetch project analytics
  fetchProjectAnalytics: async (projectId) => {
    set({ loading: true, error: null });
    try {
      const data = await analyticsApi.getProjectAnalytics(projectId);
      set({ 
        projectAnalytics: data,
        lastUpdated: new Date(),
        loading: false 
      });
      return { success: true, data };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to fetch project analytics';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Fetch timeline analytics
  fetchTimelineAnalytics: async (projectId, dateRange = null) => {
    set({ loading: true, error: null });
    try {
      const range = dateRange || get().dateRange;
      const data = await analyticsApi.getTimeline(projectId, range);
      set({ 
        timelineData: data,
        loading: false 
      });
      return { success: true, data };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to fetch timeline analytics';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Fetch member analytics
  fetchMemberAnalytics: async (projectId, username) => {
    set({ loading: true, error: null });
    try {
      const data = await analyticsApi.getMemberAnalytics(projectId, username);
      set((state) => ({
        memberAnalytics: {
          ...state.memberAnalytics,
          [username]: data
        },
        loading: false
      }));
      return { success: true, data };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to fetch member analytics';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Set date range
  setDateRange: (range) => {
    set({ dateRange: range });
  },

  // Set selected metric
  setSelectedMetric: (metric) => {
    set({ selectedMetric: metric });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Refresh all analytics
  refreshAnalytics: async (projectId) => {
    const { fetchProjectAnalytics, fetchTimelineAnalytics } = get();
    
    set({ loading: true, error: null });
    try {
      await Promise.all([
        fetchProjectAnalytics(projectId),
        fetchTimelineAnalytics(projectId)
      ]);
      
      set({ 
        lastUpdated: new Date(),
        loading: false 
      });
      
      toast.success('Analytics refreshed successfully!');
      return { success: true };
    } catch (error) {
      const errorMessage = 'Failed to refresh analytics';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Get computed metrics
  getKPIMetrics: () => {
    const { projectAnalytics } = get();
    if (!projectAnalytics) return null;

    const {
      total_tasks = 0,
      completed_tasks = 0,
      in_progress_tasks = 0,
      todo_tasks = 0,
      overall_progress = 0,
      team_size = 0,
      tasks_by_priority = {},
      team_productivity = []
    } = projectAnalytics;

    // Calculate team completion rate
    const teamCompletionRate = team_productivity.length > 0 
      ? team_productivity.reduce((sum, member) => sum + member.completion_rate, 0) / team_productivity.length
      : 0;

    // Calculate on-time completion (simplified - could be enhanced with due dates)
    const onTimeCompletion = completed_tasks > 0 ? 85 : 0; // Mock data

    return {
      overallProgress: overall_progress,
      totalTasks: total_tasks,
      teamProductivity: Math.round(teamCompletionRate),
      onTimeCompletion: onTimeCompletion,
      taskBreakdown: {
        completed: completed_tasks,
        inProgress: in_progress_tasks,
        todo: todo_tasks
      },
      priorityBreakdown: tasks_by_priority,
      teamSize: team_size
    };
  },

  // Get timeline data for charts
  getTimelineChartData: () => {
    const { timelineData } = get();
    return timelineData.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      completed: item.completed,
      total: item.total,
      progress: item.progress
    }));
  },

  // Get task distribution data for pie chart
  getTaskDistributionData: () => {
    const { projectAnalytics } = get();
    if (!projectAnalytics) return [];

    const { completed_tasks = 0, in_progress_tasks = 0, todo_tasks = 0 } = projectAnalytics;
    
    return [
      { name: 'Completed', value: completed_tasks, color: '#10B981' },
      { name: 'In Progress', value: in_progress_tasks, color: '#3B82F6' },
      { name: 'To Do', value: todo_tasks, color: '#6B7280' }
    ].filter(item => item.value > 0);
  },

  // Get priority distribution data for bar chart
  getPriorityDistributionData: () => {
    const { projectAnalytics } = get();
    if (!projectAnalytics) return [];

    const { tasks_by_priority = {} } = projectAnalytics;
    
    return [
      { priority: 'High', count: tasks_by_priority.high || 0, color: '#EF4444' },
      { priority: 'Medium', count: tasks_by_priority.medium || 0, color: '#F59E0B' },
      { priority: 'Low', count: tasks_by_priority.low || 0, color: '#10B981' }
    ];
  },

  // Get team performance data
  getTeamPerformanceData: () => {
    const { projectAnalytics } = get();
    if (!projectAnalytics) return [];

    const { team_productivity = [] } = projectAnalytics;
    
    return team_productivity.map(member => ({
      username: member.username,
      role: member.role || 'developer',
      tasksAssigned: member.tasks_assigned || 0,
      tasksCompleted: member.tasks_completed || 0,
      completionRate: member.completion_rate || 0,
      averageCompletionTime: member.average_completion_time || 0,
      lastActive: member.last_active || new Date().toISOString()
    }));
  },

  // Get member analytics
  getMemberAnalytics: (username) => {
    const { memberAnalytics } = get();
    return memberAnalytics[username] || null;
  },

  // Clear all data
  clearAnalytics: () => {
    set({
      projectAnalytics: null,
      timelineData: [],
      memberAnalytics: {},
      error: null,
      lastUpdated: null
    });
  }
}));

export default useAnalyticsStore;
