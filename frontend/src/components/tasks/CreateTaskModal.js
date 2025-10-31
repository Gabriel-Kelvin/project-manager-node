import React, { useState } from 'react';
import { X, User, AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import useTaskStore from '../../store/taskStore';
import useProjectStore from '../../store/projectStore';

const CreateTaskModal = ({ projectId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    assigned_to: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { createTask } = useTaskStore();
  const { selectedProject } = useProjectStore();

  const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
  ];

  const statusOptions = [
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ];

  const teamMembers = selectedProject?.team_members || [];
  const assigneeOptions = [
    { value: '', label: 'Unassigned' },
    ...teamMembers.map(member => ({
      value: member.username,
      label: member.username,
    })),
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 150) {
      newErrors.title = 'Title must be less than 150 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (!formData.priority) {
      newErrors.priority = 'Priority is required';
    }

    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const result = await createTask(projectId, formData);
      
      if (result.success) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal isOpen onClose={handleClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Task</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={loading}
            className="p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Task Title *
            </label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter task title..."
              error={errors.title}
              maxLength={150}
              disabled={loading}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.title && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.title}
                </p>
              )}
              <p className="text-sm text-gray-500 ml-auto">
                {formData.title.length}/150
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter task description..."
              rows={4}
              error={errors.description}
              maxLength={500}
              disabled={loading}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.description && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.description}
                </p>
              )}
              <p className="text-sm text-gray-500 ml-auto">
                {formData.description.length}/500
              </p>
            </div>
          </div>

          {/* Priority and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                Priority *
              </label>
              <Select
                id="priority"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                error={errors.priority}
                disabled={loading}
              >
                {priorityOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
              {errors.priority && (
                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.priority}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <Select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                error={errors.status}
                disabled={loading}
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
              {errors.status && (
                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.status}
                </p>
              )}
            </div>
          </div>

          {/* Assigned To */}
          <div>
            <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700 mb-2">
              Assign To
            </label>
            <Select
              id="assigned_to"
              value={formData.assigned_to}
              onChange={(e) => handleInputChange('assigned_to', e.target.value)}
              disabled={loading}
            >
              {assigneeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Select>
            {teamMembers.length === 0 && (
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                <User className="w-4 h-4" />
                No team members available. Add team members to the project first.
              </p>
            )}
          </div>

          {/* Preview */}
          {formData.title && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
              <div className="space-y-2">
                <h5 className="font-medium text-gray-900">{formData.title}</h5>
                {formData.description && (
                  <p className="text-sm text-gray-600">{formData.description}</p>
                )}
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-gray-500">
                    Priority: <span className="font-medium capitalize">{formData.priority}</span>
                  </span>
                  <span className="text-gray-500">
                    Status: <span className="font-medium capitalize">{formData.status.replace('_', ' ')}</span>
                  </span>
                  {formData.assigned_to && (
                    <span className="text-gray-500">
                      Assigned: <span className="font-medium">{formData.assigned_to}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="min-w-24"
          >
            {loading ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateTaskModal;
