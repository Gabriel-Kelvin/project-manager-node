import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FolderKanban, 
  Users, 
  Clock, 
  ArrowRight,
  MoreHorizontal,
  Calendar,
  ListTodo
} from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { formatDate, getRoleColor, getProgressColor } from '../../utils/helpers';

const RecentProjects = () => {
  const { recentProjects, loading, getRecentProjectsSorted } = useDashboardStore();
  const [sortBy, setSortBy] = useState('recent');

  const sortedProjects = getRecentProjectsSorted(sortBy);
  const displayProjects = sortedProjects.slice(0, 6);

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

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 20) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg animate-pulse">
              <div className="flex items-start justify-between mb-2">
                <div className="h-5 w-24 bg-gray-200 rounded" />
                <div className="h-5 w-16 bg-gray-200 rounded" />
              </div>
              <div className="h-4 w-32 bg-gray-200 rounded mb-3" />
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 bg-gray-200 rounded" />
                <div className="h-2 w-16 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!displayProjects || displayProjects.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Projects</h2>
          <Link
            to="/projects"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderKanban className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Projects Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Get started by creating your first project or joining an existing one.
          </p>
          <Link 
            to="/projects" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FolderKanban className="w-4 h-4" />
            Create Project
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Recent Projects</h2>
        <div className="flex items-center gap-3">
          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="recent">Most Recent</option>
            <option value="active">Most Active</option>
            <option value="progress">By Progress</option>
          </select>
          
          <Link
            to="/projects"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {displayProjects.map((project) => (
          <Link
            key={project.id}
            to={`/projects/${project.id}`}
            className="block p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-900 transition-colors truncate">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {project.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                {getStatusBadge(project)}
                <Badge variant={getRoleColor(project.role)} size="sm">
                  {project.role}
                </Badge>
              </div>
            </div>
            
            {/* Project stats */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <ListTodo className="w-4 h-4" />
                  <span>{project.task_count || 0} tasks</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{project.team_size || 1} members</span>
                </div>
                {project.updated_at && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(project.updated_at, 'relative')}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${getProgressColor(project.progress || 0)} transition-all duration-500 ease-out`}
                  style={{ width: `${project.progress || 0}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-right">
                {project.progress || 0}%
              </span>
            </div>

            {/* Hover effect indicator */}
            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-gray-500">
                {project.created_at && (
                  <span>Created {formatDate(project.created_at, 'relative')}</span>
                )}
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </Link>
        ))}
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

export default RecentProjects;
