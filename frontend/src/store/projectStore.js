import { create } from 'zustand';
import { projects as projectsApi } from '../services/api';
import { toast } from '../components/Toast';

const useProjectStore = create((set, get) => ({
  projects: [],
  selectedProject: null,
  loading: false,
  error: null,

  // Fetch all projects
  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const response = await projectsApi.getAll();
      // Handle both array and object response formats
      const projects = Array.isArray(response) ? response : (response.projects || []);
      set({ projects, loading: false });
      return { success: true, data: projects };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to fetch projects';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Fetch project by ID
  fetchProjectById: async (projectId) => {
    set({ loading: true, error: null });
    try {
      const data = await projectsApi.getById(projectId);
      set({ selectedProject: data, loading: false });
      return { success: true, data };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to fetch project';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Create new project
  createProject: async (projectData) => {
    set({ loading: true, error: null });
    try {
      const data = await projectsApi.create(projectData);
      set((state) => ({
        projects: [...state.projects, data],
        loading: false,
      }));
      toast.success('Project created successfully!');
      return { success: true, data };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to create project';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Update project
  updateProject: async (projectId, projectData) => {
    set({ loading: true, error: null });
    try {
      const data = await projectsApi.update(projectId, projectData);
      set((state) => ({
        projects: state.projects.map((p) => (p.id === projectId ? data : p)),
        selectedProject: state.selectedProject?.id === projectId ? data : state.selectedProject,
        loading: false,
      }));
      toast.success('Project updated successfully!');
      return { success: true, data };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to update project';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Delete project
  deleteProject: async (projectId) => {
    set({ loading: true, error: null });
    try {
      await projectsApi.delete(projectId);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== projectId),
        selectedProject: state.selectedProject?.id === projectId ? null : state.selectedProject,
        loading: false,
      }));
      toast.success('Project deleted successfully!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to delete project';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Set selected project
  setSelectedProject: (project) => {
    set({ selectedProject: project });
  },

  // Clear selected project
  clearSelectedProject: () => {
    set({ selectedProject: null });
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

export default useProjectStore;

