import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { formatDate } from '../../utils/helpers';

const DeleteTaskConfirmation = ({ task, onClose, onConfirm, loading = false }) => {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal isOpen onClose={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center space-x-3 p-6 border-b border-gray-200">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Delete Task</h2>
            <p className="text-sm text-gray-600">This action cannot be undone</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this task? This action will permanently remove the task and cannot be undone.
            </p>
            
            {/* Task Details */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">{task.title}</h3>
              {task.description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {task.description}
                </p>
              )}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Priority: {task.priority}</span>
                <span>Status: {task.status.replace('_', ' ')}</span>
                {task.assigned_to && (
                  <span>Assigned: {task.assigned_to}</span>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Created {formatDate(task.created_at)}
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">
                <p className="font-medium">Warning</p>
                <p>This will permanently delete the task and remove it from all project views and reports.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
            className="flex items-center gap-2 min-w-24"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete Task
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteTaskConfirmation;
