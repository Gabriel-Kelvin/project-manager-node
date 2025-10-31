import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus, ArrowRight, BarChart2, ListTodo } from 'lucide-react';
import useProjectStore from '../store/projectStore';
import useTaskStore from '../store/taskStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Loading from '../components/Loading';
import { capitalize, getProgressColor, formatDate } from '../utils/helpers';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { selectedProject, fetchProjectById, updateProject, loading: projectLoading, error: projectError } = useProjectStore();
  const { tasks, fetchTasksByProject, loading: taskLoading } = useTaskStore();

  useEffect(() => {
    if (id) {
      fetchProjectById(id);
      fetchTasksByProject(id);
    }
  }, [id, fetchProjectById, fetchTasksByProject]);

  // Support both shapes: tasks keyed by projectId OR a flat array of tasks
  const projectTasks = Array.isArray(tasks?.[id])
    ? tasks[id]
    : Array.isArray(tasks)
    ? tasks.filter((t) => String(t.project_id) === String(id))
    : [];
  const [saving, setSaving] = useState(false);
  const [localStatus, setLocalStatus] = useState('');
  const [localProgress, setLocalProgress] = useState(0);

  // Keep local UI state in sync with selected project
  useEffect(() => {
    if (selectedProject) {
      setLocalStatus(selectedProject.status || 'active');
      setLocalProgress(typeof selectedProject.progress === 'number' ? selectedProject.progress : 0);
    }
  }, [selectedProject]);

  if (projectLoading && !selectedProject) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loading text="Loading project..." />
      </div>
    );
  }

  if (projectError) {
    return (
      <div className="max-w-5xl mx-auto">
        <Card className="p-8 text-center">
          <p className="text-red-600 mb-4">{projectError}</p>
          <Button onClick={() => fetchProjectById(id)}>Try Again</Button>
        </Card>
      </div>
    );
  }

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loading text="Preparing project..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{selectedProject.name}</h1>
          <div className="mt-2 flex items-center gap-3">
            <Badge variant={selectedProject.status}>{capitalize((selectedProject.status || 'active').replace('_', ' '))}</Badge>
            <select
              value={localStatus}
              onChange={async (e) => {
                const value = e.target.value;
                setLocalStatus(value);
                setSaving(true);
                await updateProject(id, { status: value });
                setSaving(false);
              }}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
              disabled={saving}
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
              <option value="archived">Archived</option>
            </select>
            <span className="text-sm text-gray-500">Created {formatDate(selectedProject.created_at)}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={BarChart2} onClick={() => navigate(`/projects/${id}/analytics`)}>
            Analytics
          </Button>
          <Button icon={Plus} onClick={() => navigate(`/projects/${id}/tasks`)}>
            Add Task
          </Button>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Progress</span>
            <span className="text-sm font-medium">{localProgress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full ${getProgressColor(localProgress)} transition-all duration-300`}
              style={{ width: `${localProgress}%` }}
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={100}
              value={localProgress}
              onChange={(e) => setLocalProgress(Number(e.target.value))}
              className="w-full"
            />
            <Button
              size="sm"
              onClick={async () => {
                setSaving(true);
                await updateProject(id, { progress: localProgress });
                setSaving(false);
              }}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-gray-600">Tasks</div>
          <div className="text-2xl font-semibold">{projectTasks.length}</div>
          <Button variant="ghost" size="sm" className="mt-3" onClick={() => navigate(`/projects/${id}/tasks`)}>
            View tasks <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-gray-600">Team</div>
          <div className="text-2xl font-semibold">{selectedProject.team_members?.length || 0}</div>
        </Card>
      </div>

      {/* Recent tasks */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-primary-600" /> Recent Tasks
          </h3>
          <Link to={`/projects/${id}/tasks`} className="text-primary-600 text-sm">See all</Link>
        </div>
        {taskLoading && projectTasks.length === 0 ? (
          <div className="py-8 text-center text-gray-500">Loading tasks...</div>
        ) : projectTasks.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No tasks yet. Create your first task.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {projectTasks.slice(0, 5).map((task) => (
              <li key={task.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{task.title}</div>
                  <div className="text-sm text-gray-600">{task.status}</div>
                </div>
                <Link to={`/projects/${id}/tasks`} className="text-primary-600 text-sm flex items-center gap-1">
                  Open <ArrowRight className="w-4 h-4" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default ProjectDetail;


