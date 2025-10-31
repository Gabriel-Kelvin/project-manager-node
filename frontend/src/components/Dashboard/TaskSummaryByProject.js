import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FolderKanban, 
  CheckCircle, 
  Clock, 
  Circle,
  ArrowRight,
  TrendingUp,
  Users
} from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { formatDate, getProgressColor } from '../../utils/helpers';

const TaskSummaryByProject = () => {
  const { recentProjects, loading, getTopProjectsByTasks } = useDashboardStore();
  const [sortBy, setSortBy] = useState('tasks');
  const [showOnlyActive, setShowOnlyActive] = useState(false);

  // Get project summaries with task breakdowns
  const getProjectSummaries = () => {
    let projects = recentProjects || [];
    
    // Filter active projects if requested
    if (showOnlyActive) {
      projects = projects.filter(p => p.progress > 0 && p.progress < 100);
    }
    
    // Sort projects
    switch (sortBy) {
      case 'tasks':
        return projects.sort((a, b) => (b.task_count || 0) - (a.task_count || 0));
      case 'progress':
        return projects.sort((a, b) => (b.progress || 0) - (a.progress || 0));
      case 'name':
        return projects.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return projects;
    }
  };

  const projectSummaries = getProjectSummaries().slice(0, 6);

  const getTaskBreakdown = (project) => {
    // Mock task breakdown - in real app, this would come from API
    const totalTasks = project.task_count || 0;
    const completed = Math.round((totalTasks * (project.progress || 0)) / 100);
    const inProgress = Math.round(totalTasks * 0.2); // 20% in progress
    const todo = totalTasks - completed - inProgress;
    
    return {
      total: totalTasks,
      completed: Math.max(0, completed),
      inProgress: Math.max(0, inProgress),
      todo: Math.max(0, todo)
    };
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 20) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const getStatusBadge = (project) => {
    const progress = project.progress || 0;
    if (progress === 100) {
      return <Badge variant="success" size="sm">Completed</Badge>;
    } else if (progress > 0) {
      return <Badge variant="info" size="sm">Active</Badge>;
    } else {
      return <Badge variant="secondary" size="sm">Planning</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="h-5 w-32 bg-gray-200 rounded" />
                <div className="h-5 w-16 bg-gray-200 rounded" />
              </div>
              <div className="h-2 w-full bg-gray-200 rounded mb-2" />
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-4 w-12 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!projectSummaries || projectSummaries.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Task Summary by Project</h2>
        </div>

        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderKanban className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Projects Found
          </h3>
          <p className="text-gray-600 mb-6">
            {showOnlyActive 
              ? "No active projects with tasks found."
              : "No projects with tasks found."
            }
          </p>
          <Link 
            to="/projects" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FolderKanban className="w-4 h-4" />
            View Projects
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Task Summary by Project</h2>
        <div className="flex items-center gap-3">
          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="tasks">Most Tasks</option>
            <option value="progress">By Progress</option>
            <option value="name">By Name</option>
          </select>
          
          {/* Active filter toggle */}
          <button
            onClick={() => setShowOnlyActive(!showOnlyActive)}
            className={`
              text-sm px-3 py-1 rounded-md transition-colors
              ${showOnlyActive 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            Active Only
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {projectSummaries.map((project) => {
          const breakdown = getTaskBreakdown(project);
          
          return (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="block p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FolderKanban className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">
                      {project.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{breakdown.total} tasks</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{project.team_size || 1} members</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getStatusBadge(project)}
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium text-gray-900">{project.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${getProgressColor(project.progress || 0)} transition-all duration-500 ease-out`}
                    style={{ width: `${project.progress || 0}%` }}
                  />
                </div>
              </div>
              
              {/* Task breakdown */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-3 h-3" />
                    <span>{breakdown.completed} completed</span>
                  </div>
                  <div className="flex items-center gap-1 text-blue-600">
                    <Clock className="w-3 h-3" />
                    <span>{breakdown.inProgress} in progress</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Circle className="w-3 h-3" />
                    <span>{breakdown.todo} todo</span>
                  </div>
                </div>
                
                {project.updated_at && (
                  <span className="text-gray-500">
                    Updated {formatDate(project.updated_at, 'relative')}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Show more projects indicator */}
      {recentProjects.length > 6 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Link
            to="/projects"
            className="text-sm text-gray-600 hover:text-blue-600 flex items-center justify-center gap-1"
          >
            View {recentProjects.length - 6} more projects
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </Card>
  );
};

export default TaskSummaryByProject;
