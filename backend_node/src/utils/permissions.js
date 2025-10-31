import { supabase } from './supabase.js';

export const Permission = {
    CREATE_PROJECT: 'create_project',
    EDIT_PROJECT: 'edit_project',
    DELETE_PROJECT: 'delete_project',
    VIEW_PROJECT: 'view_project',
    CREATE_TASK: 'create_task',
    EDIT_TASK: 'edit_task',
    DELETE_TASK: 'delete_task',
    VIEW_TASK: 'view_task',
    ASSIGN_TASK: 'assign_task',
    UPDATE_TASK_STATUS: 'update_task_status',
    MANAGE_TEAM: 'manage_team',
    ADD_MEMBER: 'add_member',
    REMOVE_MEMBER: 'remove_member',
    UPDATE_ROLE: 'update_role',
    VIEW_ANALYTICS: 'view_analytics'
};

export const Role = {
    OWNER: 'owner',
    MANAGER: 'manager',
    DEVELOPER: 'developer',
    VIEWER: 'viewer'
};

const ROLE_PERMISSIONS = {
    [Role.OWNER]: Object.values(Permission),
    [Role.MANAGER]: [
        Permission.EDIT_PROJECT,
        Permission.VIEW_PROJECT,
        Permission.CREATE_TASK,
        Permission.EDIT_TASK,
        Permission.DELETE_TASK,
        Permission.VIEW_TASK,
        Permission.ASSIGN_TASK,
        Permission.UPDATE_TASK_STATUS,
        Permission.ADD_MEMBER,
        Permission.VIEW_ANALYTICS
    ],
    [Role.DEVELOPER]: [
        Permission.VIEW_PROJECT,
        Permission.CREATE_TASK,
        Permission.VIEW_TASK,
        Permission.UPDATE_TASK_STATUS
    ],
    [Role.VIEWER]: [
        Permission.VIEW_PROJECT,
        Permission.VIEW_TASK
    ]
};

export async function getUserRoleInProject(username, projectId) {
    const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .maybeSingle();
    if (project && project.owner_id === username) return Role.OWNER;
    const { data: members } = await supabase
        .from('team_members')
        .select('*')
        .eq('project_id', projectId)
        .eq('username', username);
    if (members && members.length > 0) return members[0].role;
    return null;
}

export function checkPermission(userRole, requiredPermission) {
    if (!userRole) return false;
    const roleKey = String(userRole).toLowerCase();
    const perms = ROLE_PERMISSIONS[roleKey] || [];
    return perms.includes(requiredPermission);
}

export async function isProjectOwner(username, projectId) {
    const { data: project } = await supabase
        .from('projects')
        .select('owner_id')
        .eq('id', projectId)
        .maybeSingle();
    return !!(project && project.owner_id === username);
}

export async function isProjectMember(username, projectId) {
    if (await isProjectOwner(username, projectId)) return true;
    const role = await getUserRoleInProject(username, projectId);
    return !!role;
}

export async function canEditTask(username, projectId, taskOwner) {
    const role = await getUserRoleInProject(username, projectId);
    if (!role) return false;
    if (role === Role.OWNER || role === Role.MANAGER) return true;
    if (role === Role.DEVELOPER) return taskOwner === username;
    return false;
}

export async function canDeleteTask(username, projectId) {
    const role = await getUserRoleInProject(username, projectId);
    return role === Role.OWNER || role === Role.MANAGER;
}

export async function canAssignTask(username, projectId) {
    const role = await getUserRoleInProject(username, projectId);
    return checkPermission(role, Permission.ASSIGN_TASK);
}


