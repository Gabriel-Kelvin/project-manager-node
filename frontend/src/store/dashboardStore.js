import { create } from 'zustand';
import { dashboard as dashboardApi } from '../services/api';
import { toast } from '../components/Toast';

const useDashboardStore = create((set, get) => ({
  // State
  dashboardData: null,
  userStats: null,
  recentProjects: [],
  myTasks: [],
  activityFeed: [],
  loading: false,
  error: null,
  lastUpdated: null,

  // Actions
  fetchDashboardData: async () => {
    set({ loading: true, error: null });
    try {
      const data = await dashboardApi.getSummary();
      
      // Transform the data to match our expected structure
      const transformedData = {
        userStats: {
          totalProjects: data.statistics?.total_projects || 0,
          totalTasks: data.statistics?.total_assigned_tasks || 0,
          completedToday: data.statistics?.completed_tasks_by_me || 0,
          inProgress: data.statistics?.in_progress_tasks_by_me || 0,
          completionRate: data.statistics?.total_assigned_tasks > 0 
            ? Math.round((data.statistics.completed_tasks_by_me / data.statistics.total_assigned_tasks) * 100)
            : 0
        },
        recentProjects: data.user_projects || [],
        myTasks: data.my_tasks || [],
        activityFeed: data.recent_activities || [],
        taskSummaryByProject: data.task_summary_by_project || []
      };

      set({ 
        dashboardData: data,
        userStats: transformedData.userStats,
        recentProjects: transformedData.recentProjects,
        myTasks: transformedData.myTasks,
        activityFeed: transformedData.activityFeed,
        lastUpdated: new Date(),
        loading: false 
      });

      return { success: true, data: transformedData };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to fetch dashboard data';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  refreshDashboard: async () => {
    const { fetchDashboardData } = get();
    const result = await fetchDashboardData();
    
    if (result.success) {
      toast.success('Dashboard refreshed successfully!');
    }
    
    return result;
  },

  clearError: () => {
    set({ error: null });
  },

  // Get filtered tasks by status
  getTasksByStatus: (status) => {
    const { myTasks } = get();
    if (!myTasks) return [];
    
    if (status === 'all') return myTasks;
    return myTasks.filter(task => task.status === status);
  },

  // Get task counts by status
  getTaskCounts: () => {
    const { myTasks } = get();
    if (!myTasks) return { all: 0, todo: 0, in_progress: 0, completed: 0 };
    
    return {
      all: myTasks.length,
      todo: myTasks.filter(t => t.status === 'todo').length,
      in_progress: myTasks.filter(t => t.status === 'in_progress').length,
      completed: myTasks.filter(t => t.status === 'completed').length
    };
  },

  // Get recent projects sorted by activity
  getRecentProjectsSorted: (sortBy = 'recent') => {
    const { recentProjects } = get();
    if (!recentProjects) return [];
    
    const sorted = [...recentProjects];
    
    switch (sortBy) {
      case 'recent':
        return sorted.sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));
      case 'active':
        return sorted.sort((a, b) => (b.task_count || 0) - (a.task_count || 0));
      case 'progress':
        return sorted.sort((a, b) => (b.progress || 0) - (a.progress || 0));
      default:
        return sorted;
    }
  },

  // Get top projects by task count
  getTopProjectsByTasks: (limit = 6) => {
    const { recentProjects } = get();
    if (!recentProjects) return [];
    
    return recentProjects
      .sort((a, b) => (b.task_count || 0) - (a.task_count || 0))
      .slice(0, limit);
  },

  // Get urgent tasks (high priority or overdue)
  getUrgentTasks: () => {
    const { myTasks } = get();
    if (!myTasks) return [];
    
    const now = new Date();
    return myTasks.filter(task => {
      const isHighPriority = task.priority === 'high';
      const isOverdue = task.due_date && new Date(task.due_date) < now && task.status !== 'completed';
      return isHighPriority || isOverdue;
    }).sort((a, b) => {
      // Sort by priority first, then by due date
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (b.priority === 'high' && a.priority !== 'high') return 1;
      if (a.due_date && b.due_date) {
        return new Date(a.due_date) - new Date(b.due_date);
      }
      return 0;
    });
  },

  // Get recent activities with formatting
  getFormattedActivities: (limit = 10) => {
    const { activityFeed } = get();
    if (!activityFeed) return [];
    
    return activityFeed.slice(0, limit).map(activity => ({
      ...activity,
      formattedTime: getRelativeTime(activity.created_at),
      icon: getActivityIcon(activity.type),
      color: getActivityColor(activity.type)
    }));
  },

  // Clear all data
  clearDashboard: () => {
    set({
      dashboardData: null,
      userStats: null,
      recentProjects: [],
      myTasks: [],
      activityFeed: [],
      error: null,
      lastUpdated: null
    });
  }
}));

// Helper functions
const getRelativeTime = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now - date;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
};

const getActivityIcon = (type) => {
  const icons = {
    'project_created': '📁',
    'task_created': '📝',
    'task_completed': '✅',
    'task_assigned': '👤',
    'user_joined': '👥',
    'project_updated': '🔄',
    'comment_added': '💬'
  };
  return icons[type] || '📋';
};

const getActivityColor = (type) => {
  const colors = {
    'project_created': 'text-blue-600',
    'task_created': 'text-green-600',
    'task_completed': 'text-emerald-600',
    'task_assigned': 'text-purple-600',
    'user_joined': 'text-orange-600',
    'project_updated': 'text-indigo-600',
    'comment_added': 'text-gray-600'
  };
  return colors[type] || 'text-gray-600';
};

export default useDashboardStore;
