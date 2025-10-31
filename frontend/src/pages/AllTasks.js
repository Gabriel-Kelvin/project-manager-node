import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import useProjectStore from '../store/projectStore';
import useTaskStore from '../store/taskStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import TaskSearch from '../components/tasks/TaskSearch';
import TaskList from '../components/tasks/TaskList';
import CreateTaskModal from '../components/tasks/CreateTaskModal';
import EditTaskModal from '../components/tasks/EditTaskModal';
import Loading from '../components/Loading';

const AllTasks = () => {
  const { projects, fetchProjects, setSelectedProject } = useProjectStore();
  const { tasks, fetchTasksByProject, deleteTask, loading, error, setError } = useTaskStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetchProjects();
      if (res?.data) {
        // Fetch tasks for each project (sequentially to avoid flooding)
        for (const p of res.data) {
          // eslint-disable-next-line no-await-in-loop
          await fetchTasksByProject(p.id);
        }
      }
    };
    load();
  }, [fetchProjects, fetchTasksByProject]);

  const allTasks = useMemo(() => {
    return Object.values(tasks).flat();
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (!searchTerm) return allTasks;
    const s = searchTerm.toLowerCase();
    return allTasks.filter((t) =>
      (t.title || '').toLowerCase().includes(s) ||
      (t.description || '').toLowerCase().includes(s) ||
      (t.assigned_to || '').toLowerCase().includes(s)
    );
  }, [allTasks, searchTerm]);

  if (loading && allTasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => setError(null)}>Dismiss</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Tasks</h1>
          <p className="text-gray-600">View and manage all your tasks across projects</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select project to create task</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <Button onClick={() => setShowCreateModal(true)} disabled={!selectedProjectId} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Task
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <TaskSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} placeholder="Search tasks..." />
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        </Card>
      ) : (
        <TaskList
          tasks={filteredTasks}
          selectedTasks={[]}
          onTaskSelect={() => {}}
          onTaskClick={() => {}}
          onSelectAll={() => {}}
          onTaskEdit={(task) => {
            setEditingTask(task);
            // Set the project as selected so EditTaskModal can access team members
            const project = projects.find(p => p.id === task.project_id);
            if (project) {
              setSelectedProject(project);
            }
            setShowEditModal(true);
          }}
          onTaskDelete={async (task) => {
            try {
              const result = await deleteTask(task.project_id, task.id);
              if (result.success) {
                // Task deleted successfully
              }
            } catch (err) {
              console.error('Failed to delete task:', err);
            }
          }}
          loading={loading}
        />
      )}

      {showCreateModal && selectedProjectId && (
        <CreateTaskModal
          projectId={selectedProjectId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            // Refresh tasks
            fetchTasksByProject(selectedProjectId);
          }}
        />
      )}

      {showEditModal && editingTask && (
        <EditTaskModal
          task={editingTask}
          projectId={editingTask.project_id}
          onClose={() => {
            setShowEditModal(false);
            setEditingTask(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setEditingTask(null);
            // Refresh tasks
            fetchTasksByProject(editingTask.project_id);
          }}
        />
      )}
    </div>
  );
};

export default AllTasks;


