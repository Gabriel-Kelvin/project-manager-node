import React, { useState } from 'react';
import { Plus, MoreVertical } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { formatDate, getPriorityColor } from '../../utils/helpers';
import useTaskStore from '../../store/taskStore';

const KanbanBoard = ({ 
  tasksByStatus, 
  onTaskClick, 
  onTaskMove,
  projectId 
}) => {
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  
  const { updateTaskStatus } = useTaskStore();

  const columns = [
    { 
      id: 'todo', 
      title: 'To Do', 
      tasks: tasksByStatus.todo || [],
      color: 'gray',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    },
    { 
      id: 'in_progress', 
      title: 'In Progress', 
      tasks: tasksByStatus.in_progress || [],
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    { 
      id: 'completed', 
      title: 'Completed', 
      tasks: tasksByStatus.completed || [],
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
  ];

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDragLeave = (e) => {
    // Only clear if we're leaving the column entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e, targetColumnId) => {
    e.preventDefault();
    
    if (!draggedTask || draggedTask.status === targetColumnId) {
      setDraggedTask(null);
      setDragOverColumn(null);
      return;
    }

    try {
      await updateTaskStatus(projectId, draggedTask.id, targetColumnId);
      onTaskMove?.(draggedTask.id, targetColumnId);
    } catch (error) {
      console.error('Failed to update task status:', error);
    }

    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const TaskCard = ({ task }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, task)}
      onDragEnd={handleDragEnd}
      className="bg-white rounded-lg border border-gray-200 p-3 mb-3 cursor-move hover:shadow-md transition-shadow group"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
          {task.title}
        </h4>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onTaskClick(task);
            }}
            className="p-1 h-6 w-6"
          >
            <MoreVertical className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <Badge 
          variant={getPriorityColor(task.priority)}
          size="sm"
        >
          {task.priority}
        </Badge>
        
        {task.assigned_to && (
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">
                {task.assigned_to.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="truncate max-w-16">{task.assigned_to}</span>
          </div>
        )}
      </div>

      <div className="mt-2 text-xs text-gray-400">
        {formatDate(task.created_at, 'short')}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((column) => (
        <div
          key={column.id}
          className={`${column.bgColor} rounded-lg border-2 ${column.borderColor} p-4 min-h-96 ${
            dragOverColumn === column.id ? 'border-blue-400 bg-blue-100' : ''
          } transition-colors`}
          onDragOver={(e) => handleDragOver(e, column.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          {/* Column Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900">{column.title}</h3>
              <span className="bg-white text-gray-600 text-xs px-2 py-1 rounded-full">
                {column.tasks.length}
              </span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Handle add task to this column
                // This would open a create task modal with pre-selected status
              }}
              className="p-1 h-6 w-6 text-gray-400 hover:text-gray-600"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Tasks */}
          <div className="space-y-3">
            {column.tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
            
            {/* Empty State */}
            {column.tasks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-sm">No tasks</div>
                <div className="text-xs mt-1">Drag tasks here or create new ones</div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;
