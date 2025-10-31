import React, { useState } from 'react';
import { 
  Trash2, 
  CheckCircle, 
  Circle, 
  PlayCircle, 
  User, 
  AlertTriangle,
  X
} from 'lucide-react';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Modal from '../ui/Modal';
import useTaskStore from '../../store/taskStore';

const BulkTaskActions = ({ selectedTasks, onClearSelection, projectId }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');

  const { bulkUpdateTasks, bulkDeleteTasks } = useTaskStore();

  const statusOptions = [
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ];

  const handleBulkDelete = async () => {
    setLoading(true);
    try {
      const taskIds = selectedTasks.map(task => task.id);
      await bulkDeleteTasks(projectId, taskIds);
      onClearSelection();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (!selectedStatus) return;

    setLoading(true);
    try {
      const taskIds = selectedTasks.map(task => task.id);
      await bulkUpdateTasks(projectId, taskIds, { status: selectedStatus });
      onClearSelection();
      setShowStatusModal(false);
      setSelectedStatus('');
    } catch (error) {
      console.error('Failed to update task status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAssign = async () => {
    setLoading(true);
    try {
      const taskIds = selectedTasks.map(task => task.id);
      await bulkUpdateTasks(projectId, taskIds, { assigned_to: selectedAssignee || null });
      onClearSelection();
      setShowAssignModal(false);
      setSelectedAssignee('');
    } catch (error) {
      console.error('Failed to assign tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusCounts = () => {
    const counts = { todo: 0, in_progress: 0, completed: 0 };
    selectedTasks.forEach(task => {
      counts[task.status] = (counts[task.status] || 0) + 1;
    });
    return counts;
  };

  const getPriorityCounts = () => {
    const counts = { low: 0, medium: 0, high: 0 };
    selectedTasks.forEach(task => {
      counts[task.priority] = (counts[task.priority] || 0) + 1;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();
  const priorityCounts = getPriorityCounts();

  return (
    <>
      {/* Bulk Actions Bar */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-blue-800">
                  {selectedTasks.length}
                </span>
              </div>
              <span className="text-sm font-medium text-blue-900">
                {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
              </span>
            </div>

            {/* Quick Stats */}
            <div className="hidden md:flex items-center space-x-4 text-xs text-blue-700">
              {Object.entries(statusCounts).map(([status, count]) => (
                count > 0 && (
                  <span key={status} className="flex items-center space-x-1">
                    <span className="capitalize">{status.replace('_', ' ')}:</span>
                    <span className="font-medium">{count}</span>
                  </span>
                )
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Bulk Actions */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStatusModal(true)}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Change Status
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAssignModal(true)}
              className="flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Assign
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Status Update Modal */}
      {showStatusModal && (
        <Modal isOpen onClose={() => setShowStatusModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Change Status</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStatusModal(false)}
                className="p-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-600">
                Change the status of {selectedTasks.length} selected task{selectedTasks.length !== 1 ? 's' : ''}.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>
                <Select
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  options={statusOptions}
                  placeholder="Select status..."
                />
              </div>

              {/* Current Status Breakdown */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Current Status</h4>
                <div className="space-y-1">
                  {Object.entries(statusCounts).map(([status, count]) => (
                    count > 0 && (
                      <div key={status} className="flex justify-between text-sm">
                        <span className="capitalize text-gray-600">
                          {status.replace('_', ' ')}
                        </span>
                        <span className="font-medium text-gray-900">{count}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <Button
                variant="outline"
                onClick={() => setShowStatusModal(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkStatusUpdate}
                disabled={loading || !selectedStatus}
                className="min-w-24"
              >
                {loading ? 'Updating...' : 'Update Status'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Bulk Assign Modal */}
      {showAssignModal && (
        <Modal isOpen onClose={() => setShowAssignModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Assign Tasks</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAssignModal(false)}
                className="p-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-600">
                Assign {selectedTasks.length} selected task{selectedTasks.length !== 1 ? 's' : ''} to a team member.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign To
                </label>
                <Select
                  value={selectedAssignee}
                  onChange={setSelectedAssignee}
                  options={[
                    { value: '', label: 'Unassigned' },
                    // This would be populated with actual team members
                    { value: 'user1', label: 'User 1' },
                    { value: 'user2', label: 'User 2' },
                  ]}
                  placeholder="Select assignee..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <Button
                variant="outline"
                onClick={() => setShowAssignModal(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkAssign}
                disabled={loading}
                className="min-w-24"
              >
                {loading ? 'Assigning...' : 'Assign Tasks'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal isOpen onClose={() => setShowDeleteModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 p-6 border-b border-gray-200">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Delete Tasks</h2>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete {selectedTasks.length} selected task{selectedTasks.length !== 1 ? 's' : ''}? 
                This action will permanently remove the tasks and cannot be undone.
              </p>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-700">
                    <p className="font-medium">Warning</p>
                    <p>This will permanently delete all selected tasks and remove them from all project views and reports.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
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
                    Delete Tasks
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default BulkTaskActions;
