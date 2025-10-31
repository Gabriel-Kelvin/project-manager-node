import { Router } from 'express';
import { supabase } from '../utils/supabase.js';
import { getTokenFromHeader, verifyAuthToken } from '../utils/middleware.js';
import { getUserRoleInProject } from '../utils/permissions.js';

const router = Router();

router.get('/dashboard', getTokenFromHeader, verifyAuthToken, async (req, res, next) => {
    try {
        const username = req.user.username;
        const { data: owned } = await supabase.from('projects').select('*').eq('owner_id', username);
        const { data: memberships } = await supabase.from('team_members').select('project_id').eq('username', username);
        const ids = new Set((memberships || []).map(m => m.project_id));
        const teamProjects = [];
        for (const id of ids) {
            const { data: p } = await supabase.from('projects').select('*').eq('id', id).maybeSingle();
            if (p) teamProjects.push(p);
        }
        const map = new Map();
        [...(owned || []), ...teamProjects].forEach(p => map.set(p.id, p));
        const unique = Array.from(map.values());
        const user_projects = [];
        for (const p of unique) {
            const project_id = p.id;
            const role = await getUserRoleInProject(username, project_id);
            const { data: team } = await supabase.from('team_members').select('id').eq('project_id', project_id);
            const { data: tasks } = await supabase.from('tasks').select('id').eq('project_id', project_id);
            user_projects.push({
                id: project_id,
                name: p.name,
                progress: p.progress ?? 0,
                role,
                team_size: (team || []).length + 1,
                task_count: (tasks || []).length,
                status: p.status,
                description: p.description
            });
        }
        // My tasks
        const { data: myTasksRaw } = await supabase
            .from('tasks')
            .select('*')
            .eq('assigned_to', username);
        const my_tasks = [];
        for (const t of myTasksRaw || []) {
            const { data: project } = await supabase.from('projects').select('name').eq('id', t.project_id).maybeSingle();
            my_tasks.push({
                id: t.id,
                title: t.title,
                status: t.status,
                priority: t.priority,
                project_id: t.project_id,
                project_name: project?.name || null,
                description: t.description,
                created_at: t.created_at,
                updated_at: t.updated_at
            });
        }
        // Statistics (match frontend expectations)
        const total_assigned_tasks = (myTasksRaw || []).length;
        const completed_tasks_by_me = (myTasksRaw || []).filter(t => t.status === 'completed').length;
        const in_progress_tasks_by_me = (myTasksRaw || []).filter(t => t.status === 'in_progress').length;
        const todo_tasks_by_me = (myTasksRaw || []).filter(t => t.status === 'todo').length;
        const statistics = {
            total_projects: user_projects.length,
            total_assigned_tasks,
            completed_tasks_by_me,
            in_progress_tasks_by_me,
            todo_tasks_by_me
        };
        // Keep backward-compatible fields too
        statistics.total_tasks = total_assigned_tasks;
        statistics.completed_tasks = completed_tasks_by_me;
        statistics.in_progress_tasks = in_progress_tasks_by_me;
        statistics.todo_tasks = todo_tasks_by_me;

        res.json({ user_projects, my_tasks, statistics });
    } catch (e) {
        next({ status: 400, detail: e.message || 'Failed to get dashboard' });
    }
});

router.get('/dashboard/summary', getTokenFromHeader, verifyAuthToken, async (req, res, next) => {
    try {
        const username = req.user.username;
        const email = req.user.email;
        const { data: myTasksRaw } = await supabase
            .from('tasks')
            .select('*')
            .eq('assigned_to', username);
        const total_tasks = (myTasksRaw || []).length;
        const completed = (myTasksRaw || []).filter(t => t.status === 'completed').length;
        const in_progress = (myTasksRaw || []).filter(t => t.status === 'in_progress').length;
        const todo = (myTasksRaw || []).filter(t => t.status === 'todo').length;
        res.json({
            username,
            email,
            total_tasks,
            completed_tasks: completed,
            in_progress_tasks: in_progress,
            todo_tasks: todo
        });
    } catch (e) {
        next({ status: 400, detail: e.message || 'Failed to get summary' });
    }
});

router.get('/dashboard/recent-activity', getTokenFromHeader, verifyAuthToken, async (req, res, next) => {
    try {
        const username = req.user.username;
        const limit = parseInt(req.query.limit || '10', 10);
        const { data: owned } = await supabase.from('projects').select('id').eq('owner_id', username);
        const { data: memberships } = await supabase.from('team_members').select('project_id').eq('username', username);
        const ids = new Set([...(owned || []).map(p => p.id), ...(memberships || []).map(m => m.project_id)]);
        let recentTasks = [];
        for (const id of ids) {
            const { data: tasks } = await supabase
                .from('tasks')
                .select('*')
                .eq('project_id', id);
            recentTasks.push(...(tasks || []));
        }
        recentTasks.sort((a, b) => String(b.updated_at || '').localeCompare(String(a.updated_at || '')));
        recentTasks = recentTasks.slice(0, limit);
        const activity = [];
        for (const t of recentTasks) {
            const { data: project } = await supabase.from('projects').select('name').eq('id', t.project_id).maybeSingle();
            activity.push({
                type: 'task_updated',
                task_id: t.id,
                task_title: t.title,
                task_status: t.status,
                project_id: t.project_id,
                project_name: project?.name || 'Unknown',
                updated_at: t.updated_at
            });
        }
        res.json({ recent_activity: activity, count: activity.length });
    } catch (e) {
        next({ status: 400, detail: e.message || 'Failed to get recent activity' });
    }
});

export default router;


