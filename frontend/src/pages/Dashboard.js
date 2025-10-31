import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  ListTodo,
  CheckCircle,
  Clock,
  TrendingUp,
  ArrowRight,
  Loader2,
  Calendar,
  RefreshCw
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import useDashboardStore from '../store/dashboardStore';
import { toast } from '../components/Toast';
import Loading from '../components/Loading';
import QuickStats from '../components/Dashboard/QuickStats';
import RecentProjects from '../components/Dashboard/RecentProjects';
import MyTasksQuickView from '../components/Dashboard/MyTasksQuickView';
import TaskSummaryByProject from '../components/Dashboard/TaskSummaryByProject';
import ActivityFeed from '../components/Dashboard/ActivityFeed';
import QuickNavigation from '../components/Dashboard/QuickNavigation';
import {
  formatDate,
  getStatusColor,
  getPriorityColor,
  getRoleColor,
  getProgressColor,
  formatStatus,
  capitalize,
} from '../utils/helpers';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { 
    loading, 
    error, 
    lastUpdated, 
    fetchDashboardData, 
    refreshDashboard,
    clearError 
  } = useDashboardStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      await fetchDashboardData();
    } catch (error) {
      console.error('Dashboard error:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshDashboard();
    } finally {
      setIsRefreshing(false);
    }
  };

  const getCurrentTime = () => {
    return new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loading text="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={clearError}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Dismiss
            </button>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 lg:p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">
              Welcome back, {user?.username}!
            </h1>
            <p className="text-blue-100">
              Here's what's happening with your projects today.
            </p>
          </div>
          
          <div className="flex flex-col lg:items-end gap-2">
            <div className="flex items-center gap-2 text-blue-100">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{getCurrentTime()}</span>
            </div>
            {lastUpdated && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-500 hover:bg-blue-400 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <span className="text-xs text-blue-200">
                  Updated {Math.floor((new Date() - lastUpdated) / 60000)}m ago
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <QuickStats />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Projects and Tasks */}
        <div className="xl:col-span-2 space-y-6">
          <RecentProjects />
          <MyTasksQuickView />
        </div>

        {/* Right Column - Activity and Summary */}
        <div className="space-y-6">
          <ActivityFeed />
          <TaskSummaryByProject />
        </div>
      </div>

      {/* Quick Navigation */}
      <QuickNavigation />
    </div>
  );
};

export default Dashboard;

