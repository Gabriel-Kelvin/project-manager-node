import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { getStatusColor, getPriorityColor } from '../../utils/helpers';

const TaskFilters = ({ 
  filters, 
  onFiltersChange, 
  onClearFilters, 
  teamMembers = [] 
}) => {
  const statusOptions = [
    { value: 'todo', label: 'To Do', color: 'gray' },
    { value: 'in_progress', label: 'In Progress', color: 'blue' },
    { value: 'completed', label: 'Completed', color: 'green' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'green' },
    { value: 'medium', label: 'Medium', color: 'yellow' },
    { value: 'high', label: 'High', color: 'red' },
  ];

  const sortOptions = [
    { value: 'created_at', label: 'Created Date' },
    { value: 'updated_at', label: 'Updated Date' },
    { value: 'title', label: 'Title' },
    { value: 'priority', label: 'Priority' },
    { value: 'status', label: 'Status' },
    { value: 'assigned_to', label: 'Assigned To' },
  ];

  const handleFilterChange = (filterType, value) => {
    const currentValues = filters[filterType] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    onFiltersChange({ [filterType]: newValues });
  };

  const handleSortChange = (sortBy) => {
    onFiltersChange({ sort_by: sortBy });
  };

  const handleSortOrderChange = () => {
    onFiltersChange({ 
      sort_order: filters.sort_order === 'asc' ? 'desc' : 'asc' 
    });
  };

  const removeFilter = (filterType, value) => {
    const currentValues = filters[filterType] || [];
    onFiltersChange({ 
      [filterType]: currentValues.filter(v => v !== value) 
    });
  };

  const getActiveFilterCount = () => {
    return filters.status.length + filters.priority.length + filters.assigned_to.length;
  };

  return (
    <Card className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        {getActiveFilterCount() > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
          >
            <RotateCcw className="w-4 h-4" />
            Clear All
          </Button>
        )}
      </div>

      {/* Status Filter */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Status</h4>
        <div className="space-y-2">
          {statusOptions.map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.status.includes(option.value)}
                onChange={() => handleFilterChange('status', option.value)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 flex items-center gap-2">
                <span 
                  className={`w-2 h-2 rounded-full ${
                    option.color === 'gray' ? 'bg-gray-400' :
                    option.color === 'blue' ? 'bg-blue-400' :
                    'bg-green-400'
                  }`}
                />
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Priority Filter */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Priority</h4>
        <div className="space-y-2">
          {priorityOptions.map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.priority.includes(option.value)}
                onChange={() => handleFilterChange('priority', option.value)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 flex items-center gap-2">
                <span 
                  className={`w-2 h-2 rounded-full ${
                    option.color === 'green' ? 'bg-green-400' :
                    option.color === 'yellow' ? 'bg-yellow-400' :
                    'bg-red-400'
                  }`}
                />
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Assigned To Filter */}
      {teamMembers.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Assigned To</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {teamMembers.map((member) => (
              <label key={member.username} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.assigned_to.includes(member.username)}
                  onChange={() => handleFilterChange('assigned_to', member.username)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {member.username}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Sort Options */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Sort By</h4>
        <div className="space-y-2">
          {sortOptions.map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="radio"
                name="sort_by"
                value={option.value}
                checked={filters.sort_by === option.value}
                onChange={() => handleSortChange(option.value)}
                className="border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                {option.label}
              </span>
            </label>
          ))}
        </div>
        
        <div className="mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSortOrderChange}
            className="w-full"
          >
            {filters.sort_order === 'asc' ? '↑ Ascending' : '↓ Descending'}
          </Button>
        </div>
      </div>

      {/* Active Filters */}
      {getActiveFilterCount() > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Active Filters</h4>
          <div className="space-y-2">
            {filters.status.map((status) => (
              <div key={`status-${status}`} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded">
                <span className="text-xs text-gray-600">
                  Status: {statusOptions.find(s => s.value === status)?.label}
                </span>
                <button
                  onClick={() => removeFilter('status', status)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            
            {filters.priority.map((priority) => (
              <div key={`priority-${priority}`} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded">
                <span className="text-xs text-gray-600">
                  Priority: {priorityOptions.find(p => p.value === priority)?.label}
                </span>
                <button
                  onClick={() => removeFilter('priority', priority)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            
            {filters.assigned_to.map((username) => (
              <div key={`assigned-${username}`} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded">
                <span className="text-xs text-gray-600">
                  Assigned: {username}
                </span>
                <button
                  onClick={() => removeFilter('assigned_to', username)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default TaskFilters;
