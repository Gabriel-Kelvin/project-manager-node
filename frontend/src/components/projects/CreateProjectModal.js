import React, { useState } from 'react';
import { FolderPlus } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Button from '../ui/Button';
import useProjectStore from '../../store/projectStore';

const CreateProjectModal = ({ isOpen, onClose }) => {
  const { createProject, loading } = useProjectStore();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
  });
  
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    const result = await createProject(formData);
    if (result.success) {
      onClose();
      // Reset form
      setFormData({
        name: '',
        description: '',
        status: 'active',
      });
      setErrors({});
    }
  };

  const isValid = formData.name.trim().length >= 3 && formData.name.length <= 100;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project" size="md">
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
            icon={FolderPlus}
            className="flex-1"
            loading={loading}
            disabled={!isValid || loading}
          >
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProjectModal;

