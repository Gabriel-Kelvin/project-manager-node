import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ListTodo, 
  CheckCircle, 
  Clock, 
  Circle,
  ArrowRight,
  Plus,
  Filter
} from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { formatDate, getStatusColor, getPriorityColor } from '../../utils/helpers';

const MyTasksQuickView = () => {
  const { myTasks, loading, getTasksByStatus, getTaskCounts } = useDashboardStore();
  const [activeFilter, setActiveFilter] = useState('all');
  const [showCompleted, setShowCompleted] = useState(false);

  const taskCounts = getTaskCounts();
  const filteredTasks = getTasksByStatus(activeFilter);
  const displayTasks = showCompleted 
    ? filteredTasks 
    : filteredTasks.filter(task => task.status !== 'completed');

  const filters = [
    { key: 'all', label: 'All', count: taskCounts.all, icon: ListTodo },
    { key: 'todo', label: 'Todo', count: taskCounts.todo, icon: Circle },
    { key: 'in_progress', label: 'In Progress', count: taskCounts.in_progress, icon: Clock },
    { key: 'completed', label: 'Completed', count: taskCounts.completed, icon: CheckCircle }
  ];

  const getTaskIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getUrgencyIndicator = (task) => {
    if (task.priority === 'high') {
      return <div className="w-2 h-2 bg-red-500 rounded-full" />;
    }
    if (task.due_date) {
      const dueDate = new Date(task.due_date);
      const now = new Date();
      const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDue < 0) {
        return <div className="w-2 h-2 bg-red-500 rounded-full" />; // Overdue
      } else if (daysUntilDue <= 1) {
        return <div className="w-2 h-2 bg-yellow-500 rounded-full" />; // Due soon
      }
    }
    return null;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
        
        {/* Filter tabs skeleton */}
        <div className="flex gap-2 mb-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
        
        {/* Task list skeleton */}
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg animate-pulse">
              <div className="flex items-start justify-between mb-2">
                <div className="h-5 w-3/4 bg-gray-200 rounded" />
                <div className="h-5 w-16 bg-gray-200 rounded" />
              </div>
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

  if (!myTasks || myTasks.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">My Tasks</h2>
          <Link
            to="/tasks"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ListTodo className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Tasks Assigned
          </h3>
          <p className="text-gray-600 mb-6">
            You don't have any tasks assigned yet. Check back later or ask your team lead for assignments.
          </p>
          <Link 
            to="/tasks" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ListTodo className="w-4 h-4" />
            View All Tasks
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">My Tasks</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{taskCounts.all} tasks</span>
          <Link
            to="/tasks"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.key;
          
          return (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                ${isActive 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{filter.label}</span>
              <span className={`
                px-2 py-0.5 text-xs rounded-full
                ${isActive ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600'}
              `}>
                {filter.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Show completed toggle */}
      {activeFilter === 'all' && taskCounts.completed > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
          >
            <Filter className="w-4 h-4" />
            {showCompleted ? 'Hide' : 'Show'} completed tasks ({taskCounts.completed})
          </button>
        </div>
      )}

      {/* Tasks list */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {displayTasks.length > 0 ? (
          displayTasks.slice(0, 8).map((task) => (
            <Link
              key={task.id}
              to={`/tasks/${task.id}`}
              className="block p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {getTaskIcon(task.status)}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-900 transition-colors line-clamp-2">
                      {task.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {task.project_name}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-3">
                  {getUrgencyIndicator(task)}
                  <Badge variant={getStatusColor(task.status)} size="sm">
                    {task.status}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <Badge variant={getPriorityColor(task.priority)} size="sm">
                    {task.priority}
                  </Badge>
                  {task.due_date && (
                    <span className="text-gray-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(task.due_date, 'short')}
                    </span>
                  )}
                </div>
                
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              {filters.find(f => f.key === activeFilter)?.icon && (
                React.createElement(filters.find(f => f.key === activeFilter).icon, { 
                  className: "w-6 h-6 text-gray-400" 
                })
              )}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeFilter === 'all' ? '' : activeFilter} tasks
            </h3>
            <p className="text-gray-600 mb-4">
              {activeFilter === 'all' 
                ? "You don't have any tasks assigned yet."
                : `You don't have any ${activeFilter} tasks.`
              }
            </p>
            {activeFilter === 'all' && (
              <Link 
                to="/tasks" 
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                View All Tasks
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Show more indicator */}
      {displayTasks.length > 8 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Link
            to="/tasks"
            className="text-sm text-gray-600 hover:text-blue-600 flex items-center justify-center gap-1"
          >
            View {displayTasks.length - 8} more tasks
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </Card>
  );
};

export default MyTasksQuickView;
