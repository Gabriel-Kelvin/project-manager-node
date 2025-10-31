import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { create } from 'zustand';

// Toast store using Zustand
export const useToastStore = create((set, get) => ({
  toasts: [],
  
  addToast: (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    const toast = { id, message, type, duration };
    
    set((state) => ({
      toasts: [...state.toasts, toast],
    }));
    
    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
    
    return id;
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
  
  clearAll: () => {
    set({ toasts: [] });
  },
}));

// Toast helper functions
export const toast = {
  success: (message, duration) => useToastStore.getState().addToast(message, 'success', duration),
  error: (message, duration) => useToastStore.getState().addToast(message, 'error', duration),
  info: (message, duration) => useToastStore.getState().addToast(message, 'info', duration),
  warning: (message, duration) => useToastStore.getState().addToast(message, 'warning', duration),
};

// Single toast component
const ToastItem = ({ toast: toastItem, onClose }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  const colors = {
    success: 'bg-success-50 text-success-800 border-success-200',
    error: 'bg-danger-50 text-danger-800 border-danger-200',
    warning: 'bg-warning-50 text-warning-800 border-warning-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${
        colors[toastItem.type]
      } min-w-[300px] max-w-md animate-slide-down`}
    >
      {icons[toastItem.type]}
      <p className="flex-1 text-sm font-medium">{toastItem.message}</p>
      <button
        onClick={() => onClose(toastItem.id)}
        className="text-gray-500 hover:text-gray-700 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Toast container component
const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toastItem) => (
        <ToastItem key={toastItem.id} toast={toastItem} onClose={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;

