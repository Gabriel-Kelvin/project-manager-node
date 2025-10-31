import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, AlertTriangle } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import useProjectStore from '../../store/projectStore';

const DeleteConfirmation = ({ isOpen, onClose, project }) => {
  const navigate = useNavigate();
  const { deleteProject, loading } = useProjectStore();

  const handleDelete = async () => {
    const result = await deleteProject(project.id);
    if (result.success) {
      onClose();
      // If we're on the project detail page, navigate to projects list
      if (window.location.pathname.includes(`/projects/${project.id}`)) {
        navigate('/projects');
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Project" size="sm">
      <div className="space-y-4">
        {/* Warning Icon */}
        <div className="flex justify-center">
          <div className="bg-danger-100 rounded-full p-3">
            <AlertTriangle className="w-8 h-8 text-danger-600" />
          </div>
        </div>

        {/* Warning Message */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Are you sure?
          </h3>
          <p className="text-gray-600">
            You are about to delete the project:
          </p>
          <p className="font-semibold text-gray-900 mt-2">"{project.name}"</p>
        </div>

        {/* Additional Warning */}
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
          <p className="text-sm text-warning-800">
            <strong>Warning:</strong> This action cannot be undone. All tasks, team members, and
            analytics associated with this project will be permanently deleted.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
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
            type="button"
            variant="danger"
            icon={Trash2}
            onClick={handleDelete}
            className="flex-1"
            loading={loading}
          >
            Delete Project
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmation;

