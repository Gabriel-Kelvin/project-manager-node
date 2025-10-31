import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  ArrowRight, 
  Filter,
  RefreshCw,
  User,
  FolderKanban,
  CheckCircle,
  Plus,
  MessageSquare
} from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const ActivityFeed = () => {
  const { activityFeed, loading, getFormattedActivities, refreshDashboard } = useDashboardStore();
  const [filter, setFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const formattedActivities = getFormattedActivities(10);
  
  // Filter activities by type
  const filteredActivities = filter === 'all' 
    ? formattedActivities 
    : formattedActivities.filter(activity => activity.type === filter);

  const activityTypes = [
    { key: 'all', label: 'All', icon: Activity },
    { key: 'project_created', label: 'Projects', icon: FolderKanban },
    { key: 'task_created', label: 'Tasks', icon: Plus },
    { key: 'task_completed', label: 'Completed', icon: CheckCircle },
    { key: 'user_joined', label: 'Team', icon: User },
    { key: 'comment_added', label: 'Comments', icon: MessageSquare }
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshDashboard();
    } finally {
      setIsRefreshing(false);
    }
  };

  const getActivityIcon = (type) => {
    const icons = {
      'project_created': <FolderKanban className="w-4 h-4" />,
      'task_created': <Plus className="w-4 h-4" />,
      'task_completed': <CheckCircle className="w-4 h-4" />,
      'task_assigned': <User className="w-4 h-4" />,
      'user_joined': <User className="w-4 h-4" />,
      'project_updated': <RefreshCw className="w-4 h-4" />,
      'comment_added': <MessageSquare className="w-4 h-4" />
    };
    return icons[type] || <Activity className="w-4 h-4" />;
  };

  const getActivityColor = (type) => {
    const colors = {
      'project_created': 'bg-blue-100 text-blue-600',
      'task_created': 'bg-green-100 text-green-600',
      'task_completed': 'bg-emerald-100 text-emerald-600',
      'task_assigned': 'bg-purple-100 text-purple-600',
      'user_joined': 'bg-orange-100 text-orange-600',
      'project_updated': 'bg-indigo-100 text-indigo-600',
      'comment_added': 'bg-gray-100 text-gray-600'
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  const getActivityDescription = (activity) => {
    const { type, username, project_name, task_title, target_user } = activity;
    
    switch (type) {
      case 'project_created':
        return (
          <span>
            <strong>{username}</strong> created project <strong>{project_name}</strong>
          </span>
        );
      case 'task_created':
        return (
          <span>
            <strong>{username}</strong> created task <strong>{task_title}</strong> in <strong>{project_name}</strong>
          </span>
        );
      case 'task_completed':
        return (
          <span>
            <strong>{username}</strong> completed task <strong>{task_title}</strong> in <strong>{project_name}</strong>
          </span>
        );
      case 'task_assigned':
        return (
          <span>
            <strong>{username}</strong> assigned task <strong>{task_title}</strong> to <strong>{target_user}</strong>
          </span>
        );
      case 'user_joined':
        return (
          <span>
            <strong>{username}</strong> joined project <strong>{project_name}</strong>
          </span>
        );
      case 'project_updated':
        return (
          <span>
            <strong>{username}</strong> updated project <strong>{project_name}</strong>
          </span>
        );
      case 'comment_added':
        return (
          <span>
            <strong>{username}</strong> added a comment to <strong>{task_title}</strong>
          </span>
        );
      default:
        return (
          <span>
            <strong>{username}</strong> performed an action
          </span>
        );
    }
  };

  const getActivityLink = (activity) => {
    const { type, project_id, task_id } = activity;
    
    switch (type) {
      case 'project_created':
      case 'project_updated':
      case 'user_joined':
        return `/projects/${project_id}`;
      case 'task_created':
      case 'task_completed':
      case 'task_assigned':
      case 'comment_added':
        return `/tasks/${task_id}`;
      default:
        return '#';
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
        
        {/* Filter tabs skeleton */}
        <div className="flex gap-2 mb-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
        
        {/* Activity list skeleton */}
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-start gap-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-1/2 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!filteredActivities || filteredActivities.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Recent Activity
          </h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all' 
              ? "No recent activity in your projects."
              : `No recent ${filter.replace('_', ' ')} activity.`
            }
          </p>
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Activity
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{filteredActivities.length} activities</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {activityTypes.map((type) => {
          const Icon = type.icon;
          const isActive = filter === type.key;
          const count = type.key === 'all' 
            ? formattedActivities.length 
            : formattedActivities.filter(a => a.type === type.key).length;
          
          return (
            <button
              key={type.key}
              onClick={() => setFilter(type.key)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                ${isActive 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{type.label}</span>
              {count > 0 && (
                <span className={`
                  px-2 py-0.5 text-xs rounded-full
                  ${isActive ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600'}
                `}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Activity list */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {filteredActivities.map((activity, index) => (
          <Link
            key={`${activity.id}-${index}`}
            to={getActivityLink(activity)}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            {/* User avatar */}
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {activity.username?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Activity content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-900 group-hover:text-blue-900 transition-colors">
                    {getActivityDescription(activity)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {activity.formattedTime}
                    </span>
                    {activity.project_name && (
                      <>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {activity.project_name}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Activity type icon */}
                <div className={`
                  flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center
                  ${getActivityColor(activity.type)}
                `}>
                  {getActivityIcon(activity.type)}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Show more indicator */}
      {formattedActivities.length > 10 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Link
            to="/activity"
            className="text-sm text-gray-600 hover:text-blue-600 flex items-center justify-center gap-1"
          >
            View all activity
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </Card>
  );
};

export default ActivityFeed;
