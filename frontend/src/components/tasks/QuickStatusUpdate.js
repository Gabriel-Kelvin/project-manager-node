import React, { useState } from 'react';
import { CheckCircle, Circle, PlayCircle, Loader2 } from 'lucide-react';
import Button from '../ui/Button';
import useTaskStore from '../../store/taskStore';

const QuickStatusUpdate = ({ task, projectId, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const { updateTaskStatus } = useTaskStore();

  const statusOptions = [
    { 
      value: 'todo', 
      label: 'To Do', 
      icon: <Circle className="w-4 h-4" />,
      color: 'text-gray-600 hover:text-gray-800',
      activeColor: 'text-gray-800 bg-gray-100'
    },
    { 
      value: 'in_progress', 
      label: 'In Progress', 
      icon: <PlayCircle className="w-4 h-4" />,
      color: 'text-blue-600 hover:text-blue-800',
      activeColor: 'text-blue-800 bg-blue-100'
    },
    { 
      value: 'completed', 
      label: 'Completed', 
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'text-green-600 hover:text-green-800',
      activeColor: 'text-green-800 bg-green-100'
    },
  ];

  const handleStatusChange = async (newStatus) => {
    if (newStatus === task.status || loading) return;

    setLoading(true);
    try {
      await updateTaskStatus(projectId, task.id, newStatus);
      onUpdate?.();
    } catch (error) {
      console.error('Failed to update task status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {statusOptions.map((option) => {
        const isActive = task.status === option.value;
        const isDisabled = loading;
        
        return (
          <Button
            key={option.value}
            variant="ghost"
            size="sm"
            onClick={() => handleStatusChange(option.value)}
            disabled={isDisabled}
            className={`
              flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-all
              ${isActive 
                ? option.activeColor 
                : `${option.color} hover:bg-gray-100`
              }
              ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            title={`Mark as ${option.label}`}
          >
            {loading && isActive ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              option.icon
            )}
            <span className="hidden sm:inline">{option.label}</span>
          </Button>
        );
      })}
    </div>
  );
};

export default QuickStatusUpdate;
