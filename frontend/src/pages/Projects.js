import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  Search,
  Grid3x3,
  List,
  Edit2,
  Trash2,
  Eye,
  Users,
  Calendar,
} from 'lucide-react';
import useProjectStore from '../store/projectStore';
import useAuthStore from '../store/authStore';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Loading from '../components/Loading';
import { getProgressColor, formatDate, capitalize } from '../utils/helpers';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import EditProjectModal from '../components/projects/EditProjectModal';
import DeleteConfirmation from '../components/projects/DeleteConfirmation';

const Projects = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { projects, loading, error, fetchProjects, updateProject } = useProjectStore();
  
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Filter projects - ensure projects is an array
  const filteredProjects = Array.isArray(projects) ? projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  const handleEdit = (project, e) => {
    e.stopPropagation();
    setSelectedProject(project);
    setShowEditModal(true);
  };

  const handleDelete = (project, e) => {
    e.stopPropagation();
    setSelectedProject(project);
    setShowDeleteModal(true);
  };

  const handleProjectClick = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  if (loading && (!Array.isArray(projects) || projects.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loading text="Loading projects..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Projects</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button
            variant="primary"
            onClick={() => fetchProjects()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FolderKanban className="w-8 h-8 text-primary-600" />
            My Projects
          </h1>
          <p className="text-gray-600 mt-1">Manage your projects and track progress</p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setShowCreateModal(true)}
        >
          Create New Project
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </select>

          {/* View Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-primary-100 text-primary-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary-100 text-primary-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchTerm || statusFilter !== 'all') && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">Filters:</span>
            {searchTerm && (
              <Badge variant="default" className="cursor-pointer" onClick={() => setSearchTerm('')}>
                Search: "{searchTerm}" ×
              </Badge>
            )}
            {statusFilter !== 'all' && (
              <Badge variant="default" className="cursor-pointer" onClick={() => setStatusFilter('all')}>
                Status: {capitalize(statusFilter)} ×
              </Badge>
            )}
          </div>
        )}
      </Card>

      {/* Projects Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredProjects.length} of {Array.isArray(projects) ? projects.length : 0} projects
      </div>

      {/* Projects Grid/List */}
      {filteredProjects.length === 0 ? (
        // Empty State
        <Card className="text-center py-12">
          <FolderKanban className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {(!Array.isArray(projects) || projects.length === 0) ? 'No projects yet' : 'No projects found'}
          </h3>
          <p className="text-gray-600 mb-6">
            {(!Array.isArray(projects) || projects.length === 0)
              ? 'Get started by creating your first project'
              : 'Try adjusting your search or filters'}
          </p>
          {(!Array.isArray(projects) || projects.length === 0) && (
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setShowCreateModal(true)}
            >
              Create Your First Project
            </Button>
          )}
        </Card>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              viewMode={viewMode}
              onClick={() => handleProjectClick(project.id)}
              onEdit={(e) => handleEdit(project, e)}
              onDelete={(e) => handleDelete(project, e)}
              currentUser={user}
              onUpdateProject={updateProject}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {showEditModal && selectedProject && (
        <EditProjectModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProject(null);
          }}
          project={selectedProject}
        />
      )}

      {showDeleteModal && selectedProject && (
        <DeleteConfirmation
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedProject(null);
          }}
          project={selectedProject}
        />
      )}
    </div>
  );
};

// Project Card Component
const ProjectCard = ({ project, viewMode, onClick, onEdit, onDelete, currentUser, onUpdateProject }) => {
  const [showActions, setShowActions] = useState(false);
  const isOwner = project.owner_id === currentUser?.username;
  const [saving, setSaving] = useState(false);
  const [localProgress, setLocalProgress] = useState(project.progress || 0);
  const [localStatus, setLocalStatus] = useState(project.status || 'active');

  const cardContent = (
    <>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.name}</h3>
          <Badge variant={project.status}>{capitalize(project.status.replace('_', ' '))}</Badge>
        </div>
        {isOwner && showActions && (
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="p-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 bg-danger-50 text-danger-600 rounded-lg hover:bg-danger-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {project.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
      )}

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium text-gray-900">{localProgress}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${getProgressColor(localProgress)} transition-all duration-300`}
            style={{ width: `${localProgress}%` }}
          />
        </div>
        {isOwner && (
          <div className="mt-3 flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={100}
              value={localProgress}
              onChange={(e) => setLocalProgress(Number(e.target.value))}
              className="flex-1"
            />
            <button
              onClick={async (e) => {
                e.stopPropagation();
                setSaving(true);
                await onUpdateProject(project.id, { progress: localProgress });
                setSaving(false);
              }}
              className="px-3 py-1 text-sm bg-primary-600 text-white rounded"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {/* Meta Info */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {project.team_size || 0}
          </span>
          <span>{project.task_count || 0} tasks</span>
        </div>
        <div className="flex items-center gap-3">
          {isOwner && (
            <select
              value={localStatus}
              onChange={async (e) => {
                const value = e.target.value;
                setLocalStatus(value);
                setSaving(true);
                await onUpdateProject(project.id, { status: value });
                setSaving(false);
              }}
              className="px-2 py-1 border border-gray-300 rounded"
              onClick={(e) => e.stopPropagation()}
              disabled={saving}
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
              <option value="archived">Archived</option>
            </select>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formatDate(project.created_at)}
          </span>
        </div>
      </div>
    </>
  );

  if (viewMode === 'list') {
    return (
      <Card
        hover
        onClick={onClick}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="flex items-center gap-6">
          <div className="flex-1">{cardContent}</div>
          <Button variant="outline" icon={Eye} size="sm">
            View
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card
      hover
      onClick={onClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className="transform hover:scale-105"
    >
      {cardContent}
    </Card>
  );
};

export default Projects;

