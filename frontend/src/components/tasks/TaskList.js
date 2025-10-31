import React from 'react';
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  CheckSquare,
  Square,
  Calendar,
  User
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { formatDate, getStatusColor, getPriorityColor } from '../../utils/helpers';

const TaskList = ({ 
  tasks, 
  selectedTasks, 
  onTaskSelect, 
  onTaskClick, 
  onSelectAll,
  onTaskEdit,
  onTaskDelete,
  loading = false 
}) => {
  const isAllSelected = tasks.length > 0 && selectedTasks.length === tasks.length;
  const isPartiallySelected = selectedTasks.length > 0 && selectedTasks.length < tasks.length;

  const handleSelectAll = () => {
    onSelectAll();
  };

  const handleTaskSelect = (task) => {
    onTaskSelect(task);
  };

  const handleTaskClick = (task, e) => {
    // Don't open detail if clicking on checkbox or action buttons
    if (e.target.closest('input[type="checkbox"]') || e.target.closest('[data-action]')) {
      return;
    }
    onTaskClick(task);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="flex space-x-2">
                <div className="w-16 h-6 bg-gray-200 rounded"></div>
                <div className="w-16 h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <Card className="p-4 bg-gray-50">
        <div className="flex items-center space-x-4 text-sm font-medium text-gray-600">
          <div className="w-4 h-4 flex items-center justify-center">
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={(input) => {
                if (input) input.indeterminate = isPartiallySelected;
              }}
              onChange={handleSelectAll}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">Task Name</div>
          <div className="w-20">Status</div>
          <div className="w-20">Priority</div>
          <div className="w-24">Assigned To</div>
          <div className="w-24">Created</div>
          <div className="w-24">Actions</div>
        </div>
      </Card>

      {/* Task Rows */}
      {tasks.map((task) => (
        <Card 
          key={task.id} 
          className="p-4 hover:shadow-md transition-shadow cursor-pointer group"
          onClick={(e) => handleTaskClick(task, e)}
        >
          <div className="flex items-center space-x-4">
            {/* Checkbox */}
            <div className="w-4 h-4 flex items-center justify-center">
              <input
                type="checkbox"
                checked={selectedTasks.some(t => t.id === task.id)}
                onChange={() => handleTaskSelect(task)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>

            {/* Task Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {task.title}
                </h3>
                {task.description && (
                  <span className="text-xs text-gray-500 truncate">
                    - {task.description}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(task.created_at)}</span>
                </span>
                {task.updated_at !== task.created_at && (
                  <span>Updated {formatDate(task.updated_at)}</span>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="w-20">
              <Badge 
                variant={getStatusColor(task?.status || 'todo')}
                size="sm"
              >
                {(task?.status || 'todo').replace('_', ' ')}
              </Badge>
            </div>

            {/* Priority */}
            <div className="w-20">
              <Badge 
                variant={getPriorityColor(task?.priority || 'medium')}
                size="sm"
              >
                {task?.priority || 'medium'}
              </Badge>
            </div>

            {/* Assigned To */}
            <div className="w-24">
              {task.assigned_to ? (
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <User className="w-3 h-3" />
                  <span className="truncate">{task.assigned_to}</span>
                </div>
              ) : (
                <span className="text-sm text-gray-400">Unassigned</span>
              )}
            </div>

            {/* Created Date */}
            <div className="w-24 text-sm text-gray-500">
              {formatDate(task.created_at, 'short')}
            </div>

            {/* Actions */}
            <div className="w-24 flex items-center justify-end">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onTaskEdit) onTaskEdit(task);
                  }}
                  data-action="edit"
                  className="p-2 h-10 w-10"
                  title="Edit task"
                >
                  <Edit className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onTaskDelete) {
                      if (window.confirm(`Are you sure you want to delete "${task.title || 'this task'}"?`)) {
                        onTaskDelete(task);
                      }
                    }
                  }}
                  data-action="delete"
                  className="p-2 h-10 w-10 text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Delete task"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}

      {/* Empty State */}
      {tasks.length === 0 && (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tasks found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters or create a new task.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TaskList;
