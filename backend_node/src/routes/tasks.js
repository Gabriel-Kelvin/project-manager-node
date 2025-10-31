import { Router } from 'express';
import { supabase } from '../utils/supabase.js';
import { getTokenFromHeader, verifyAuthToken } from '../utils/middleware.js';
import { getUserRoleInProject, isProjectMember, canAssignTask, canEditTask, canDeleteTask, Permission, checkPermission } from '../utils/permissions.js';

const router = Router({ mergeParams: true });

async function verifyProjectAccess(projectId, username) {
    const { data: project } = await supabase.from('projects').select('id').eq('id', projectId).maybeSingle();
    if (!project) throw { status: 404, detail: `Project ${projectId} not found` };
    const isMember = await isProjectMember(username, projectId);
    if (!isMember) throw { status: 401, detail: "You don't have access to this project" };
}

router.post('', getTokenFromHeader, verifyAuthToken, async (req, res, next) => {
    try {
        const projectId = req.params.project_id;
        const username = req.user.username;
        await verifyProjectAccess(projectId, username);
        const role = await getUserRoleInProject(username, projectId);
        if (!checkPermission(role, Permission.CREATE_TASK)) {
            next({ status: 403, detail: 'Insufficient permissions to create tasks' });
            return;
        }
        const body = req.body || {};
        if (body.assigned_to) {
            const { data: member } = await supabase
                .from('team_members')
                .select('id')
                .eq('project_id', projectId)
                .eq('username', body.assigned_to)
                .maybeSingle();
            if (!member && body.assigned_to !== username) {
                next({ status: 400, detail: `User '${body.assigned_to}' is not a member of this project` });
                return;
            }
            if (body.assigned_to !== username) {
                const ok = await canAssignTask(username, projectId);
                if (!ok) { next({ status: 403, detail: 'Insufficient permissions to assign tasks to others' }); return; }
            }
        }
        const now = new Date().toISOString();
        const payload = {
            project_id: projectId,
            title: body.title,
            description: body.description ?? null,
            assigned_to: body.assigned_to ?? null,
            status: body.status || 'todo',
            priority: body.priority || 'medium',
            created_at: now,
            updated_at: now
        };
        const { data, error } = await supabase.from('tasks').insert(payload).select('*').single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (e) {
        next(e.status ? e : { status: 400, detail: e.message || 'Failed to create task' });
    }
});

router.get('', getTokenFromHeader, verifyAuthToken, async (req, res, next) => {
    try {
        const projectId = req.params.project_id;
        const username = req.user.username;
        await verifyProjectAccess(projectId, username);
        const role = await getUserRoleInProject(username, projectId);
        if (!checkPermission(role, Permission.VIEW_TASK)) {
            next({ status: 403, detail: 'Insufficient permissions to view tasks' });
            return;
        }
        const { data: tasks } = await supabase.from('tasks').select('*').eq('project_id', projectId);
        // Frontend expects a plain array here
        res.json(tasks || []);
    } catch (e) {
        next(e.status ? e : { status: 400, detail: e.message || 'Failed to get tasks' });
    }
});

router.get('/:task_id', getTokenFromHeader, verifyAuthToken, async (req, res, next) => {
    try {
        const projectId = req.params.project_id;
        const taskId = req.params.task_id;
        const username = req.user.username;
        await verifyProjectAccess(projectId, username);
        const role = await getUserRoleInProject(username, projectId);
        if (!checkPermission(role, Permission.VIEW_TASK)) { next({ status: 403, detail: 'Insufficient permissions to view tasks' }); return; }
        const { data: task } = await supabase.from('tasks').select('*').eq('id', taskId).maybeSingle();
        if (!task || task.project_id !== projectId) throw { status: 404, detail: `Task ${taskId} not found` };
        res.json(task);
    } catch (e) {
        next(e.status ? e : { status: 400, detail: e.message || 'Failed to get task' });
    }
});

router.put('/:task_id', getTokenFromHeader, verifyAuthToken, async (req, res, next) => {
    try {
        const projectId = req.params.project_id;
        const taskId = req.params.task_id;
        const username = req.user.username;
        await verifyProjectAccess(projectId, username);
        const { data: task } = await supabase.from('tasks').select('*').eq('id', taskId).maybeSingle();
        if (!task || task.project_id !== projectId) throw { status: 404, detail: `Task ${taskId} not found` };
        const ok = await canEditTask(username, projectId, task.assigned_to || null);
        if (!ok) { next({ status: 403, detail: 'Insufficient permissions to edit this task' }); return; }
        const body = req.body || {};
        const update = {};
        ['title', 'description', 'assigned_to', 'status', 'priority'].forEach(k => {
            if (Object.prototype.hasOwnProperty.call(body, k)) update[k] = body[k];
        });
        if (Object.prototype.hasOwnProperty.call(update, 'assigned_to') && update.assigned_to !== task.assigned_to) {
            const okAssign = await canAssignTask(username, projectId);
            if (!okAssign) { next({ status: 403, detail: 'Insufficient permissions to assign tasks' }); return; }
            if (update.assigned_to) {
                const { data: member } = await supabase
                    .from('team_members')
                    .select('id')
                    .eq('project_id', projectId)
                    .eq('username', update.assigned_to)
                    .maybeSingle();
                if (!member) { next({ status: 400, detail: `User '${update.assigned_to}' is not a member of this project` }); return; }
            }
        }
        update.updated_at = new Date().toISOString();
        const { data: updated } = await supabase.from('tasks').update(update).eq('id', taskId).select('*').single();
        // Calculate project progress (simple calculation based on completed tasks)
        if (Object.prototype.hasOwnProperty.call(update, 'status')) {
            const { data: tasks } = await supabase.from('tasks').select('*').eq('project_id', projectId);
            const total = (tasks || []).length;
            const completed = (tasks || []).filter(t => t.status === 'completed').length;
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
            await supabase.from('projects').update({ progress }).eq('id', projectId);
            updated.project_progress = progress;
        }
        res.json(updated);
    } catch (e) {
        next(e.status ? e : { status: 400, detail: e.message || 'Failed to update task' });
    }
});

router.patch('/:task_id/status', getTokenFromHeader, verifyAuthToken, async (req, res, next) => {
    try {
        const projectId = req.params.project_id;
        const taskId = req.params.task_id;
        const username = req.user.username;
        await verifyProjectAccess(projectId, username);
        const { data: task } = await supabase.from('tasks').select('*').eq('id', taskId).maybeSingle();
        if (!task || task.project_id !== projectId) throw { status: 404, detail: `Task ${taskId} not found` };
        const role = await getUserRoleInProject(username, projectId);
        const hasPerm = checkPermission(role, Permission.UPDATE_TASK_STATUS);
        const isAssigned = task.assigned_to === username;
        if (!(hasPerm || isAssigned)) { next({ status: 403, detail: 'Insufficient permissions to update task status' }); return; }
        const statusValue = (req.body || {}).status;
        const { data: updated } = await supabase.from('tasks').update({ status: statusValue, updated_at: new Date().toISOString() }).eq('id', taskId).select('*').single();
        const { data: tasks } = await supabase.from('tasks').select('*').eq('project_id', projectId);
        const total = (tasks || []).length;
        const completed = (tasks || []).filter(t => t.status === 'completed').length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        await supabase.from('projects').update({ progress }).eq('id', projectId);
        updated.project_progress = progress;
        res.json(updated);
    } catch (e) {
        next(e.status ? e : { status: 400, detail: e.message || 'Failed to update status' });
    }
});

router.delete('/:task_id', getTokenFromHeader, verifyAuthToken, async (req, res, next) => {
    try {
        const projectId = req.params.project_id;
        const taskId = req.params.task_id;
        const username = req.user.username;
        await verifyProjectAccess(projectId, username);
        const { data: task } = await supabase.from('tasks').select('*').eq('id', taskId).maybeSingle();
        if (!task || task.project_id !== projectId) throw { status: 404, detail: `Task ${taskId} not found` };
        const ok = await canDeleteTask(username, projectId, task.assigned_to || null);
        if (!ok) { next({ status: 403, detail: 'Insufficient permissions to delete tasks' }); return; }
        await supabase.from('tasks').delete().eq('id', taskId);
        res.status(204).send();
    } catch (e) {
        next(e.status ? e : { status: 400, detail: e.message || 'Failed to delete task' });
    }
});

export default router;


