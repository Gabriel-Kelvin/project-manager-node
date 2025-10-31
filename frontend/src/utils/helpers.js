/**
 * Format date to readable string
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  
  return d.toLocaleDateString('en-US', options);
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const d = new Date(date);
  const diffInSeconds = Math.floor((now - d) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatDate(date);
};

/**
 * Get Tailwind color class for task status
 */
export const getStatusColor = (status) => {
  const colors = {
    todo: 'status-todo',
    in_progress: 'status-in_progress',
    completed: 'status-completed',
  };
  return colors[status] || 'status-todo';
};

/**
 * Get Tailwind color class for priority
 */
export const getPriorityColor = (priority) => {
  const colors = {
    low: 'priority-low',
    medium: 'priority-medium',
    high: 'priority-high',
  };
  return colors[priority] || 'priority-medium';
};

/**
 * Get Tailwind color class for role
 */
export const getRoleColor = (role) => {
  const colors = {
    owner: 'role-owner',
    manager: 'role-manager',
    developer: 'role-developer',
    viewer: 'role-viewer',
  };
  return colors[role] || 'role-viewer';
};

/**
 * Get color based on progress percentage
 */
export const getProgressColor = (progress) => {
  if (progress === 0) return 'bg-gray-300';
  if (progress < 30) return 'bg-danger-500';
  if (progress < 70) return 'bg-warning-500';
  if (progress < 100) return 'bg-primary-500';
  return 'bg-success-500';
};

/**
 * Get text color for progress
 */
export const getProgressTextColor = (progress) => {
  if (progress === 0) return 'text-gray-600';
  if (progress < 30) return 'text-danger-600';
  if (progress < 70) return 'text-warning-600';
  if (progress < 100) return 'text-primary-600';
  return 'text-success-600';
};

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Format status for display
 */
export const formatStatus = (status) => {
  if (!status) return '';
  return status.split('_').map(capitalize).join(' ');
};

/**
 * Truncate text to max length
 */
export const truncate = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

/**
 * Calculate completion percentage
 */
export const calculateCompletionRate = (completed, total) => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

