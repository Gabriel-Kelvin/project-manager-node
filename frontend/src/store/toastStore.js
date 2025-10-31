import { create } from 'zustand';

const useToastStore = create((set, get) => ({
  toasts: [],

  addToast: (message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      message,
      type,
      duration,
      timestamp: Date.now()
    };

    set((state) => ({
      toasts: [...state.toasts, toast]
    }));

    // Auto remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter(toast => toast.id !== id)
    }));
  },

  clearAllToasts: () => {
    set({ toasts: [] });
  },

  // Convenience methods
  success: (message, duration) => get().addToast(message, 'success', duration),
  error: (message, duration) => get().addToast(message, 'error', duration),
  warning: (message, duration) => get().addToast(message, 'warning', duration),
  info: (message, duration) => get().addToast(message, 'info', duration)
}));

export default useToastStore;
