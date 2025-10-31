import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  List, 
  Grid, 
  Calendar,
  ArrowLeft,
  MoreVertical,
  CheckSquare,
  Square
} from 'lucide-react';
import useTaskStore from '../store/taskStore';
import useProjectStore from '../store/projectStore';
import TaskFilters from '../components/tasks/TaskFilters';
import TaskSearch from '../components/tasks/TaskSearch';
import TaskList from '../components/tasks/TaskList';
import KanbanBoard from '../components/tasks/KanbanBoard';
import TaskCalendar from '../components/tasks/TaskCalendar';
import CreateTaskModal from '../components/tasks/CreateTaskModal';
import TaskDetailModal from '../components/tasks/TaskDetailModal';
import BulkTaskActions from '../components/tasks/BulkTaskActions';
import Loading from '../components/Loading';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { getStatusColor, getPriorityColor } from '../utils/helpers';

const TasksList = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [viewMode, setViewMode] = useState('list'); // 'list', 'board', 'calendar'
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const {
    tasks,
    loading,
    error,
    filters,
    selectedTask,
    fetchTasksByProject,
    getFilteredTasks,
    getTasksByStatus,
    setSelectedTask,
    clearSelectedTask,
    setFilters,
    clearFilters,
  } = useTaskStore();

  const {
    selectedProject,
    fetchProjectById,
  } = useProjectStore();

  // Fetch project and tasks on mount
  useEffect(() => {
    if (projectId) {
      fetchProjectById(projectId);
      fetchTasksByProject(projectId);
    }
  }, [projectId, fetchProjectById, fetchTasksByProject]);

  // Get filtered tasks
  const filteredTasks = useMemo(() => {
    return getFilteredTasks(projectId, searchTerm);
  }, [projectId, searchTerm, tasks, filters, getFilteredTasks]);

  // Get tasks grouped by status for Kanban view
  const tasksByStatus = useMemo(() => {
    return getTasksByStatus(projectId, searchTerm);
  }, [projectId, searchTerm, tasks, filters, getTasksByStatus]);

  // Handle task selection
  const handleTaskSelect = (task) => {
    setSelectedTask(task);
    setSelectedTasks(prev => 
      prev.find(t => t.id === task.id) 
        ? prev.filter(t => t.id !== task.id)
        : [...prev, task]
    );
  };

  // Handle select all tasks
  const handleSelectAll = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks([...filteredTasks]);
    }
  };

  // Handle task click (open detail modal)
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setSelectedTasks([]); // Clear selections when changing views
  };

  // Handle filter toggle
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    return filters.status.length + filters.priority.length + filters.assigned_to.length;
  };

  // Loading state
  if (loading && !tasks[projectId]) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => fetchTasksByProject(projectId)}>
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  const projectTasks = tasks[projectId] || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/projects/${projectId}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Project
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedProject ? `${selectedProject.name} - Tasks` : 'Tasks'}
            </h1>
            <p className="text-gray-600">
              {projectTasks.length} {projectTasks.length === 1 ? 'task' : 'tasks'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search and Filters */}
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <TaskSearch
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Search tasks..."
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={toggleFilters}
              className={`flex items-center gap-2 ${
                getActiveFilterCount() > 0 ? 'border-blue-500 text-blue-600' : ''
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {getActiveFilterCount() > 0 && (
                <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                  {getActiveFilterCount()}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleViewModeChange('list')}
            className="flex items-center gap-2"
          >
            <List className="w-4 h-4" />
            List
          </Button>
          <Button
            variant={viewMode === 'board' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleViewModeChange('board')}
            className="flex items-center gap-2"
          >
            <Grid className="w-4 h-4" />
            Board
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleViewModeChange('calendar')}
            className="flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Calendar
          </Button>
        </div>
      </div>

      {/* Filters Sidebar */}
      {showFilters && (
        <div className="lg:hidden">
          <TaskFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={clearFilters}
            teamMembers={selectedProject?.team_members || []}
          />
        </div>
      )}

      <div className="flex gap-6">
        {/* Filters Sidebar - Desktop */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <TaskFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={clearFilters}
            teamMembers={selectedProject?.team_members || []}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Bulk Actions */}
          {selectedTasks.length > 0 && (
            <BulkTaskActions
              selectedTasks={selectedTasks}
              onClearSelection={() => setSelectedTasks([])}
              projectId={projectId}
            />
          )}

          {/* Tasks Content */}
          {projectTasks.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckSquare className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No tasks yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Get started by creating your first task for this project.
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  Create Your First Task
                </Button>
              </div>
            </Card>
          ) : filteredTasks.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No tasks found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => setSearchTerm('')}>
                    Clear Search
                  </Button>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <>
              {/* List View */}
              {viewMode === 'list' && (
                <TaskList
                  tasks={filteredTasks}
                  selectedTasks={selectedTasks}
                  onTaskSelect={handleTaskSelect}
                  onTaskClick={handleTaskClick}
                  onSelectAll={handleSelectAll}
                  loading={loading}
                />
              )}

              {/* Board View */}
              {viewMode === 'board' && (
                <KanbanBoard
                  tasksByStatus={tasksByStatus}
                  onTaskClick={handleTaskClick}
                  onTaskMove={async (taskId, newStatus) => {
                    // This will be handled by the KanbanBoard component
                  }}
                  projectId={projectId}
                />
              )}

              {/* Calendar View */}
              {viewMode === 'calendar' && (
                <TaskCalendar
                  tasks={filteredTasks}
                  onTaskClick={handleTaskClick}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateTaskModal
          projectId={projectId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchTasksByProject(projectId);
          }}
        />
      )}

      {showDetailModal && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          projectId={projectId}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedTask(null);
          }}
          onUpdate={() => {
            fetchTasksByProject(projectId);
          }}
        />
      )}
    </div>
  );
};

export default TasksList;
