import { Router } from 'express';
import { supabase } from '../utils/supabase.js';
import { getTokenFromHeader, verifyAuthToken } from '../utils/middleware.js';
import { getUserRoleInProject, checkPermission, Permission } from '../utils/permissions.js';

const router = Router({ mergeParams: true });

async function verifyAnalyticsAccess(projectId, username) {
    const { data: project } = await supabase.from('projects').select('id').eq('id', projectId).maybeSingle();
    if (!project) throw { status: 404, detail: `Project ${projectId} not found` };
    const role = await getUserRoleInProject(username, projectId);
    if (!checkPermission(role, Permission.VIEW_ANALYTICS)) {
        throw { status: 403, detail: 'Insufficient permissions to view analytics (owner or manager only)' };
    }
}

router.get('', getTokenFromHeader, verifyAuthToken, async (req, res, next) => {
    try {
        const projectId = req.params.project_id;
        const username = req.user.username;
        await verifyAnalyticsAccess(projectId, username);
        const { data: project } = await supabase.from('projects').select('*').eq('id', projectId).maybeSingle();
        const { data: tasks } = await supabase.from('tasks').select('*').eq('project_id', projectId);
        const { data: members } = await supabase.from('team_members').select('*').eq('project_id', projectId);
        const total = (tasks || []).length;
        const completed = (tasks || []).filter(t => t.status === 'completed').length;
        const inProgress = (tasks || []).filter(t => t.status === 'in_progress').length;
        const todo = (tasks || []).filter(t => t.status === 'todo').length;
        const byPriority = { low: 0, medium: 0, high: 0 };
        (tasks || []).forEach(t => { if (byPriority[t.priority] !== undefined) byPriority[t.priority] += 1; });
        res.json({
            project_id: projectId,
            project_name: project?.name,
            total_tasks: total,
            completed_tasks: completed,
            in_progress_tasks: inProgress,
            todo_tasks: todo,
            overall_progress: project?.progress ?? 0,
            team_size: (members || []).length + 1,
            tasks_by_priority: byPriority,
            tasks_by_status: { todo, in_progress: inProgress, completed }
            ,
            team_productivity: []
        });
    } catch (e) {
        next(e.status ? e : { status: 400, detail: e.message || 'Failed to get analytics' });
    }
});

router.get('/timeline', getTokenFromHeader, verifyAuthToken, async (req, res, next) => {
    try {
        const projectId = req.params.project_id;
        const username = req.user.username;
        const days = parseInt(req.query.days || '30', 10);
        await verifyAnalyticsAccess(projectId, username);
        const since = new Date();
        since.setDate(since.getDate() - days);
        const { data: tasks } = await supabase
            .from('tasks')
            .select('*')
            .eq('project_id', projectId);
        const buckets = {};
        (tasks || []).forEach(t => {
            const d = new Date(t.updated_at || t.created_at || new Date()).toISOString().slice(0, 10);
            buckets[d] = buckets[d] || { date: d, completed: 0, in_progress: 0, todo: 0 };
            const s = t.status || 'todo';
            if (s === 'completed') buckets[d].completed += 1;
            else if (s === 'in_progress') buckets[d].in_progress += 1;
            else buckets[d].todo += 1;
        });
        const timeline = Object.values(buckets).sort((a, b) => a.date.localeCompare(b.date));
        res.json(timeline);
    } catch (e) {
        next(e.status ? e : { status: 400, detail: e.message || 'Failed to get timeline' });
    }
});

router.get('/member/:username', getTokenFromHeader, verifyAuthToken, async (req, res, next) => {
    try {
        const projectId = req.params.project_id;
        const targetUsername = req.params.username;
        const currentUsername = req.user.username;
        const { data: project } = await supabase.from('projects').select('id').eq('id', projectId).maybeSingle();
        if (!project) throw { status: 404, detail: `Project ${projectId} not found` };
        const role = await getUserRoleInProject(currentUsername, projectId);
        const canView = checkPermission(role, Permission.VIEW_ANALYTICS) || targetUsername === currentUsername;
        if (!canView) { next({ status: 403, detail: 'Insufficient permissions to view member analytics (owner, manager, or self only)' }); return; }
        const { data: tasks } = await supabase
            .from('tasks')
            .select('*')
            .eq('project_id', projectId)
            .eq('assigned_to', targetUsername);
        const total = (tasks || []).length;
        const completed = (tasks || []).filter(t => t.status === 'completed').length;
        const inProgress = (tasks || []).filter(t => t.status === 'in_progress').length;
        const todo = (tasks || []).filter(t => t.status === 'todo').length;
        res.json({
            username: targetUsername,
            total_tasks: total,
            completed_tasks: completed,
            in_progress_tasks: inProgress,
            todo_tasks: todo
        });
    } catch (e) {
        next(e.status ? e : { status: 400, detail: e.message || 'Failed to get member analytics' });
    }
});

export default router;


