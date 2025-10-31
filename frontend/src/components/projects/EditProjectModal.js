import React, { useState, useEffect } from 'react';
import { Edit2 } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Button from '../ui/Button';
import useProjectStore from '../../store/projectStore';

const EditProjectModal = ({ isOpen, onClose, project }) => {
  const { updateProject, loading } = useProjectStore();
  
  const [formData, setFormData] = useState({
    name: project.name || '',
    description: project.description || '',
    status: project.status || 'active',
    progress: project.progress || 0,
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'active',
        progress: project.progress || 0,
      });
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Project name must be at least 3 characters';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Project name must not exceed 100 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must not exceed 500 characters';
    }

    if (formData.progress < 0 || formData.progress > 100) {
      newErrors.progress = 'Progress must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    // Only send fields that changed
    const updates = {};
    if (formData.name !== project.name) updates.name = formData.name;
    if (formData.description !== project.description) updates.description = formData.description;
    if (formData.status !== project.status) updates.status = formData.status;
    if (formData.progress !== project.progress) updates.progress = parseInt(formData.progress);

    if (Object.keys(updates).length === 0) {
      onClose();
      return;
    }

    const result = await updateProject(project.id, updates);
    if (result.success) {
      onClose();
    }
  };

  const isValid = formData.name.trim().length >= 3 && formData.name.length <= 100;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Project" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Project Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter project name"
          required
          maxLength={100}
          showCharCount
          error={errors.name}
        />

        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter project description (optional)"
          maxLength={500}
          showCharCount
          rows={4}
          error={errors.description}
        />

        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
        </Select>

        <Input
          label="Progress"
          name="progress"
          type="number"
          value={formData.progress}
          onChange={handleChange}
          min="0"
          max="100"
          helperText="Progress percentage (0-100)"
          error={errors.progress}
        />

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={Edit2}
            className="flex-1"
            loading={loading}
            disabled={!isValid || loading}
          >
            Update Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProjectModal;

