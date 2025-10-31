import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  RefreshCw, 
  Calendar, 
  TrendingUp,
  Clock,
  Download
} from 'lucide-react';
import useAnalyticsStore from '../store/analyticsStore';
import useProjectStore from '../store/projectStore';
import KPICard from '../components/Analytics/KPICard';
import TaskDistributionChart from '../components/Analytics/TaskDistributionChart';
import PriorityChart from '../components/Analytics/PriorityChart';
import TimelineChart from '../components/Analytics/TimelineChart';
import TeamPerformanceTable from '../components/Analytics/TeamPerformanceTable';
import StatusBreakdown from '../components/Analytics/StatusBreakdown';
import ExportButton from '../components/Analytics/ExportButton';
import MemberAnalyticsModal from '../components/Analytics/MemberAnalyticsModal';
import Loading from '../components/Loading';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Select from '../components/ui/Select';
import { canViewAnalytics } from '../utils/permissions';
import useAuthStore from '../store/authStore';

const Analytics = () => {
  const { projectId } = useParams();
  const [selectedProject, setSelectedProject] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const {
    projectAnalytics,
    timelineData,
    loading,
    error,
    dateRange,
    lastUpdated,
    fetchProjectAnalytics,
    fetchTimelineAnalytics,
    refreshAnalytics,
    setDateRange,
    getKPIMetrics,
    clearError
  } = useAnalyticsStore();

  const {
    projects,
    fetchProjects,
    selectedProject: currentProject
  } = useProjectStore();

  const { user } = useAuthStore();

  // Date range options
  const dateRangeOptions = [
    { value: '7', label: 'Last 7 Days' },
    { value: '30', label: 'Last 30 Days' },
    { value: '90', label: 'Last 90 Days' },
    { value: 'all', label: 'All Time' }
  ];

  // Fetch data on mount and when project/date range changes
  useEffect(() => {
    if (projectId) {
      fetchProjectAnalytics(projectId);
      fetchTimelineAnalytics(projectId);
    }
  }, [projectId, dateRange, fetchProjectAnalytics, fetchTimelineAnalytics]);

  // Fetch projects for dropdown
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Set selected project
  useEffect(() => {
    if (projects.length > 0) {
      const project = projects.find(p => p.id === projectId) || projects[0];
      setSelectedProject(project);
    }
  }, [projects, projectId]);

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  const handleRefresh = async () => {
    if (projectId) {
      await refreshAnalytics(projectId);
    }
  };

  const handleMemberClick = (member) => {
    setSelectedMember(member);
    setShowMemberModal(true);
  };

  const handleProjectChange = (newProjectId) => {
    if (newProjectId && newProjectId !== projectId) {
      // Navigate to the new project's analytics
      window.location.href = `/projects/${newProjectId}/analytics`;
    }
  };

  const getLastUpdatedText = () => {
    if (!lastUpdated) return '';
    const minutes = Math.floor((new Date() - lastUpdated) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    return `${minutes} minutes ago`;
  };

  const kpiMetrics = getKPIMetrics();

  // Check permissions (simplified - in real app, role would come from project context)
  const userRole = 'manager'; // This would normally come from project context
  const hasAnalyticsAccess = canViewAnalytics(userRole);

  // Permission denied state
  if (!hasAnalyticsAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="p-6 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚫</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-600 mb-4">
            You don't have permission to view analytics. Only project owners and managers can access this page.
          </p>
          <Button onClick={() => window.history.back()}>
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  // Loading state
  if (loading && !projectAnalytics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <Loading />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="p-6 text-center max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={clearError} variant="outline">
              Dismiss
            </Button>
            <Button onClick={handleRefresh}>
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // No data state
  if (!projectAnalytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="p-6 text-center max-w-md">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Analytics Data
          </h3>
          <p className="text-gray-600 mb-4">
            No analytics data available for this project yet.
          </p>
          <Button onClick={handleRefresh}>
            Refresh Data
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Project Analytics
          </h1>
          
          {/* Project Selector */}
          {projects.length > 1 && (
            <div className="mt-2 max-w-xs">
              <Select
                value={projectId || ''}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="text-sm"
              >
                <option value="">Select a project...</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            </div>
          )}
          
          {selectedProject && (
            <p className="text-gray-600 mt-1">
              {selectedProject.name}
            </p>
          )}
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {getLastUpdatedText()}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Date Range Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <div className="flex bg-gray-100 rounded-lg p-1">
              {dateRangeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={dateRange === option.value ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleDateRangeChange(option.value)}
                  className="text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ExportButton projectId={projectId} />
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {kpiMetrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <KPICard
            title="Overall Progress"
            value={`${kpiMetrics.overallProgress}%`}
            subtitle="Project Completion"
            icon={TrendingUp}
            color="blue"
            progress={kpiMetrics.overallProgress}
          />
          <KPICard
            title="Total Tasks"
            value={kpiMetrics.totalTasks}
            subtitle={`${kpiMetrics.taskBreakdown.completed} completed, ${kpiMetrics.taskBreakdown.inProgress} in progress, ${kpiMetrics.taskBreakdown.todo} todo`}
            icon={Clock}
            color="purple"
          />
          <KPICard
            title="Team Productivity"
            value={`${kpiMetrics.teamProductivity}%`}
            subtitle="Team Completion Rate"
            icon={TrendingUp}
            color="green"
            progress={kpiMetrics.teamProductivity}
          />
          <KPICard
            title="On-time Completion"
            value={`${kpiMetrics.onTimeCompletion}%`}
            subtitle="Average completion rate"
            icon={Clock}
            color="orange"
            progress={kpiMetrics.onTimeCompletion}
          />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* Task Distribution Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Task Distribution
          </h3>
          <TaskDistributionChart />
        </Card>

        {/* Priority Distribution Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Priority Distribution
          </h3>
          <PriorityChart />
        </Card>
      </div>

      {/* Timeline Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Task Completion Timeline
        </h3>
        <TimelineChart />
      </Card>

      {/* Status Breakdown and Team Performance */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
        {/* Status Breakdown */}
        <div className="lg:col-span-1">
          <StatusBreakdown />
        </div>

        {/* Team Performance Table */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Team Performance
            </h3>
            <TeamPerformanceTable onMemberClick={handleMemberClick} />
          </Card>
        </div>
      </div>

      {/* Member Analytics Modal */}
      <MemberAnalyticsModal
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        member={selectedMember}
        projectId={projectId}
      />
    </div>
  );
};

export default Analytics;
