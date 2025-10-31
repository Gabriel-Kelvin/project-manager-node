/**
 * Permission utilities for frontend components
 */

// Permission levels
export const PERMISSIONS = {
  VIEW_ANALYTICS: 'view_analytics',
  EDIT_PROJECT: 'edit_project',
  DELETE_PROJECT: 'delete_project',
  MANAGE_TEAM: 'manage_team',
  CREATE_TASK: 'create_task',
  EDIT_TASK: 'edit_task',
  DELETE_TASK: 'delete_task'
};

// Role hierarchy
export const ROLES = {
  OWNER: 'owner',
  MANAGER: 'manager', 
  DEVELOPER: 'developer',
  VIEWER: 'viewer'
};

// Role permissions mapping
export const ROLE_PERMISSIONS = {
  [ROLES.OWNER]: [
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EDIT_PROJECT,
    PERMISSIONS.DELETE_PROJECT,
    PERMISSIONS.MANAGE_TEAM,
    PERMISSIONS.CREATE_TASK,
    PERMISSIONS.EDIT_TASK,
    PERMISSIONS.DELETE_TASK
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EDIT_PROJECT,
    PERMISSIONS.MANAGE_TEAM,
    PERMISSIONS.CREATE_TASK,
    PERMISSIONS.EDIT_TASK,
    PERMISSIONS.DELETE_TASK
  ],
  [ROLES.DEVELOPER]: [
    PERMISSIONS.CREATE_TASK,
    PERMISSIONS.EDIT_TASK
  ],
  [ROLES.VIEWER]: []
};

/**
 * Check if a role has a specific permission
 * @param {string} role - User role
 * @param {string} permission - Permission to check
 * @returns {boolean} True if role has permission
 */
export const hasPermission = (role, permission) => {
  if (!role || !permission) return false;
  
  const rolePermissions = ROLE_PERMISSIONS[role] || [];
  return rolePermissions.includes(permission);
};

/**
 * Check if user can view analytics
 * @param {string} role - User role
 * @returns {boolean} True if user can view analytics
 */
export const canViewAnalytics = (role) => {
  return hasPermission(role, PERMISSIONS.VIEW_ANALYTICS);
};

/**
 * Check if user can edit project
 * @param {string} role - User role
 * @returns {boolean} True if user can edit project
 */
export const canEditProject = (role) => {
  return hasPermission(role, PERMISSIONS.EDIT_PROJECT);
};

/**
 * Check if user can manage team
 * @param {string} role - User role
 * @returns {boolean} True if user can manage team
 */
export const canManageTeam = (role) => {
  return hasPermission(role, PERMISSIONS.MANAGE_TEAM);
};

/**
 * Check if user can create tasks
 * @param {string} role - User role
 * @returns {boolean} True if user can create tasks
 */
export const canCreateTask = (role) => {
  return hasPermission(role, PERMISSIONS.CREATE_TASK);
};

/**
 * Check if user can edit tasks
 * @param {string} role - User role
 * @returns {boolean} True if user can edit tasks
 */
export const canEditTask = (role) => {
  return hasPermission(role, PERMISSIONS.EDIT_TASK);
};

/**
 * Check if user can delete tasks
 * @param {string} role - User role
 * @returns {boolean} True if user can delete tasks
 */
export const canDeleteTask = (role) => {
  return hasPermission(role, PERMISSIONS.DELETE_TASK);
};

/**
 * Get user role in a project (simplified - would normally come from API)
 * @param {string} username - Username
 * @param {string} projectId - Project ID
 * @returns {string} User role in project
 */
export const getUserRoleInProject = (username, projectId) => {
  // This is a simplified version - in a real app, this would come from the API
  // For now, we'll return a default role based on some logic
  return ROLES.DEVELOPER; // Default role
};

/**
 * Check if user is project owner
 * @param {string} username - Username
 * @param {Object} project - Project object
 * @returns {boolean} True if user is project owner
 */
export const isProjectOwner = (username, project) => {
  return project && project.owner_id === username;
};

/**
 * Check if user can access member analytics
 * @param {string} currentUser - Current user username
 * @param {string} targetUser - Target user username
 * @param {string} role - Current user's role
 * @returns {boolean} True if user can view member analytics
 */
export const canViewMemberAnalytics = (currentUser, targetUser, role) => {
  // Users can view their own analytics, or if they have VIEW_ANALYTICS permission
  return currentUser === targetUser || canViewAnalytics(role);
};
