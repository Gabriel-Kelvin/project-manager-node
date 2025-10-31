import React, { useState } from 'react';
import { 
  X, 
  Edit, 
  Trash2, 
  User, 
  Calendar, 
  Clock,
  CheckCircle,
  Circle,
  PlayCircle
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { formatDate, getStatusColor, getPriorityColor } from '../../utils/helpers';
import useTaskStore from '../../store/taskStore';
import useAuthStore from '../../store/authStore';
import EditTaskModal from './EditTaskModal';
import DeleteTaskConfirmation from './DeleteTaskConfirmation';

const TaskDetailModal = ({ task, projectId, onClose, onUpdate }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const { updateTaskStatus, deleteTask } = useTaskStore();
  const { user } = useAuthStore();

  // Check if user can edit/delete this task
  const canEdit = user && (
    task.assigned_to === user.username || 
    // Add other permission checks here (project owner, manager, etc.)
    true // For now, allow all authenticated users to edit
  );

  const canDelete = user && (
    task.assigned_to === user.username ||
    // Add other permission checks here (project owner, manager, etc.)
    true // For now, allow all authenticated users to delete
  );

  const handleStatusChange = async (newStatus) => {
    if (newStatus === task.status) return;

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

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteTask(projectId, task.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete task:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'todo':
        return <Circle className="w-4 h-4" />;
      case 'in_progress':
        return <PlayCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  const statusOptions = [
    { value: 'todo', label: 'To Do', icon: <Circle className="w-4 h-4" /> },
    { value: 'in_progress', label: 'In Progress', icon: <PlayCircle className="w-4 h-4" /> },
    { value: 'completed', label: 'Completed', icon: <CheckCircle className="w-4 h-4" /> },
  ];

  return (
    <>
      <Modal isOpen onClose={onClose}>
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              {getStatusIcon(task.status)}
              <h2 className="text-xl font-semibold text-gray-900">{task.title}</h2>
            </div>
            <div className="flex items-center space-x-2">
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Description */}
            {task.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                <p className="text-gray-900 whitespace-pre-wrap">{task.description}</p>
              </div>
            )}

            {/* Task Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
                <div className="flex items-center space-x-2">
                  <Badge variant={getStatusColor(task.status)}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                  {canEdit && (
                    <div className="flex items-center space-x-1">
                      {statusOptions.map((option) => (
                        <Button
                          key={option.value}
                          variant={task.status === option.value ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => handleStatusChange(option.value)}
                          disabled={loading}
                          className="p-1 h-8 w-8"
                        >
                          {option.icon}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Priority */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Priority</h3>
                <Badge variant={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
              </div>

              {/* Assigned To */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Assigned To</h3>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">
                    {task.assigned_to || 'Unassigned'}
                  </span>
                </div>
              </div>

              {/* Created Date */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Created</h3>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{formatDate(task.created_at)}</span>
                </div>
              </div>

              {/* Updated Date */}
              {task.updated_at !== task.created_at && (
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Last Updated</h3>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{formatDate(task.updated_at)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            {canEdit && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={task.status === option.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleStatusChange(option.value)}
                      disabled={loading || task.status === option.value}
                      className="flex items-center gap-2"
                    >
                      {option.icon}
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      {showEditModal && (
        <EditTaskModal
          task={task}
          projectId={projectId}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            onUpdate?.();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteTaskConfirmation
          task={task}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          loading={loading}
        />
      )}
    </>
  );
};

export default TaskDetailModal;
