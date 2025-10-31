import { create } from 'zustand';
import { tasks as tasksApi } from '../services/api';
import { toast } from '../components/Toast';

const useTaskStore = create((set, get) => ({
  tasks: {},
  selectedTask: null,
  loading: false,
  error: null,
  filters: {
    status: [],
    priority: [],
    assigned_to: [],
    sort_by: 'created_at',
    sort_order: 'desc',
  },

  // Fetch tasks by project
  fetchTasksByProject: async (projectId) => {
    set({ loading: true, error: null });
    try {
      const data = await tasksApi.getAll(projectId);
      set((state) => ({
        tasks: {
          ...state.tasks,
          [projectId]: data,
        },
        loading: false,
      }));
      return { success: true, data };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to fetch tasks';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Fetch single task
  fetchTaskById: async (projectId, taskId) => {
    set({ loading: true, error: null });
    try {
      const data = await tasksApi.getById(projectId, taskId);
      set({ selectedTask: data, loading: false });
      return { success: true, data };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to fetch task';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Create new task
  createTask: async (projectId, taskData) => {
    set({ loading: true, error: null });
    try {
      const data = await tasksApi.create(projectId, taskData);
      set((state) => ({
        tasks: {
          ...state.tasks,
          [projectId]: [...(state.tasks[projectId] || []), data],
        },
        loading: false,
      }));
      toast.success('Task created successfully!');
      return { success: true, data };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to create task';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Update task
  updateTask: async (projectId, taskId, taskData) => {
    set({ loading: true, error: null });
    try {
      const data = await tasksApi.update(projectId, taskId, taskData);
      set((state) => ({
        tasks: {
          ...state.tasks,
          [projectId]: state.tasks[projectId]?.map((task) =>
            task.id === taskId ? data : task
          ) || [],
        },
        selectedTask: state.selectedTask?.id === taskId ? data : state.selectedTask,
        loading: false,
      }));
      toast.success('Task updated successfully!');
      return { success: true, data };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to update task';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Update task status
  updateTaskStatus: async (projectId, taskId, status) => {
    set({ loading: true, error: null });
    try {
      const data = await tasksApi.updateStatus(projectId, taskId, status);
      set((state) => ({
        tasks: {
          ...state.tasks,
          [projectId]: state.tasks[projectId]?.map((task) =>
            task.id === taskId ? { ...task, status } : task
          ) || [],
        },
        selectedTask: state.selectedTask?.id === taskId ? { ...state.selectedTask, status } : state.selectedTask,
        loading: false,
      }));
      toast.success('Task status updated!');
      return { success: true, data };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to update task status';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Delete task
  deleteTask: async (projectId, taskId) => {
    set({ loading: true, error: null });
    try {
      await tasksApi.delete(projectId, taskId);
      set((state) => ({
        tasks: {
          ...state.tasks,
          [projectId]: state.tasks[projectId]?.filter((task) => task.id !== taskId) || [],
        },
        selectedTask: state.selectedTask?.id === taskId ? null : state.selectedTask,
        loading: false,
      }));
      toast.success('Task deleted successfully!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to delete task';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Bulk update tasks
  bulkUpdateTasks: async (projectId, taskIds, updates) => {
    set({ loading: true, error: null });
    try {
      const promises = taskIds.map((taskId) => tasksApi.update(projectId, taskId, updates));
      const results = await Promise.all(promises);
      
      set((state) => ({
        tasks: {
          ...state.tasks,
          [projectId]: state.tasks[projectId]?.map((task) =>
            taskIds.includes(task.id) ? { ...task, ...updates } : task
          ) || [],
        },
        loading: false,
      }));
      
      toast.success(`${taskIds.length} tasks updated successfully!`);
      return { success: true, data: results };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to update tasks';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Bulk delete tasks
  bulkDeleteTasks: async (projectId, taskIds) => {
    set({ loading: true, error: null });
    try {
      const promises = taskIds.map((taskId) => tasksApi.delete(projectId, taskId));
      await Promise.all(promises);
      
      set((state) => ({
        tasks: {
          ...state.tasks,
          [projectId]: state.tasks[projectId]?.filter((task) => !taskIds.includes(task.id)) || [],
        },
        loading: false,
      }));
      
      toast.success(`${taskIds.length} tasks deleted successfully!`);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to delete tasks';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Set filters
  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  // Clear all filters
  clearFilters: () => {
    set({
      filters: {
        status: [],
        priority: [],
        assigned_to: [],
        sort_by: 'created_at',
        sort_order: 'desc',
      },
    });
  },

  // Get filtered and sorted tasks for a project
  getFilteredTasks: (projectId, searchTerm = '') => {
    const { tasks, filters } = get();
    const projectTasks = tasks[projectId] || [];

    let filtered = [...projectTasks];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((task) =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.assigned_to?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter((task) => filters.status.includes(task.status));
    }

    // Apply priority filter
    if (filters.priority.length > 0) {
      filtered = filtered.filter((task) => filters.priority.includes(task.priority));
    }

    // Apply assigned_to filter
    if (filters.assigned_to.length > 0) {
      filtered = filtered.filter((task) => filters.assigned_to.includes(task.assigned_to));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[filters.sort_by];
      let bValue = b[filters.sort_by];

      // Handle date sorting
      if (filters.sort_by === 'created_at' || filters.sort_by === 'updated_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // Handle string sorting
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (filters.sort_order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  },

  // Get tasks grouped by status (for Kanban view)
  getTasksByStatus: (projectId, searchTerm = '') => {
    const filteredTasks = get().getFilteredTasks(projectId, searchTerm);
    
    return {
      todo: filteredTasks.filter((task) => task.status === 'todo'),
      in_progress: filteredTasks.filter((task) => task.status === 'in_progress'),
      completed: filteredTasks.filter((task) => task.status === 'completed'),
    };
  },

  // Set selected task
  setSelectedTask: (task) => {
    set({ selectedTask: task });
  },

  // Clear selected task
  clearSelectedTask: () => {
    set({ selectedTask: null });
  },

  // Set loading
  setLoading: (loading) => {
    set({ loading });
  },

  // Set error
  setError: (error) => {
    set({ error });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));

export default useTaskStore;

