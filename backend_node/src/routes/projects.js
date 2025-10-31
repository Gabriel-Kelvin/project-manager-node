import { Router } from 'express';
import { supabase } from '../utils/supabase.js';
import { getTokenFromHeader, verifyAuthToken } from '../utils/middleware.js';
import { getUserRoleInProject, isProjectMember } from '../utils/permissions.js';

const router = Router();

async function checkProjectAccess(projectId, username, requireOwner = false) {
    const { data: project } = await supabase.from('projects').select('*').eq('id', projectId).maybeSingle();
    if (!project) throw { status: 404, detail: `Project ${projectId} not found` };
    const isOwner = project.owner_id === username;
    if (requireOwner && !isOwner) throw { status: 403, detail: 'Only project owner can perform this action' };
    if (!isOwner) {
        const { data: members } = await supabase
            .from('team_members')
            .select('*')
            .eq('project_id', projectId)
            .eq('username', username);
        if (!members || members.length === 0) throw { status: 401, detail: "You don't have access to this project" };
    }
    return project;
}

router.post('', getTokenFromHeader, verifyAuthToken, async (req, res, next) => {
    try {
        const body = req.body || {};
        const owner_id = req.user.username;
        const now = new Date().toISOString();
        const payload = {
            name: body.name,
            description: body.description ?? null,
            status: body.status || 'active',
            progress: typeof body.progress === 'number' ? body.progress : 0,
            owner_id,
            created_at: now,
            updated_at: now
        };
        const { data, error } = await supabase.from('projects').insert(payload).select('*').single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (e) {
        next({ status: 400, detail: e.message || 'Failed to create project' });
    }
});

router.get('', getTokenFromHeader, verifyAuthToken, async (req, res, next) => {
    try {
        const username = req.user.username;
        const { data: owned } = await supabase.from('projects').select('*').eq('owner_id', username);
        const { data: memberships } = await supabase.from('team_members').select('project_id').eq('username', username);
        const teamIds = new Set((memberships || []).map(m => m.project_id));
        const teamProjects = [];
        for (const pid of teamIds) {
            const { data: p } = await supabase.from('projects').select('*').eq('id', pid).maybeSingle();
            if (p) teamProjects.push(p);
        }
        const map = new Map();
        [...(owned || []), ...teamProjects].forEach(p => map.set(p.id, p));
        const unique = Array.from(map.values());
        const projectsWithTeam = [];
        for (const p of unique) {
            const { data: members } = await supabase.from('team_members').select('*').eq('project_id', p.id);
            projectsWithTeam.push({
                ...p,
                team_members: (members || []).map(m => ({ ...m }))
            });
        }
        res.json({ projects: projectsWithTeam, total: projectsWithTeam.length });
    } catch (e) {
        next({ status: 400, detail: e.message || 'Failed to fetch projects' });
    }
});

router.get('/:project_id', getTokenFromHeader, verifyAuthToken, async (req, res, next) => {
    try {
        const projectId = req.params.project_id;
        await checkProjectAccess(projectId, req.user.username);
        const { data: members } = await supabase.from('team_members').select('*').eq('project_id', projectId);
        const { data: project } = await supabase.from('projects').select('*').eq('id', projectId).maybeSingle();
        res.json({ ...project, team_members: (members || []).map(m => ({ ...m })) });
    } catch (e) {
        next(e.status ? e : { status: 400, detail: e.message || 'Failed to fetch project' });
    }
});

router.put('/:project_id', getTokenFromHeader, verifyAuthToken, async (req, res, next) => {
    try {
        const projectId = req.params.project_id;
        await checkProjectAccess(projectId, req.user.username, true);
        const update = {};
        const body = req.body || {};
        ['name', 'description', 'status', 'progress'].forEach(k => {
            if (Object.prototype.hasOwnProperty.call(body, k)) update[k] = body[k];
        });
        if (Object.keys(update).length === 0) {
            next({ status: 400, detail: 'No fields to update' });
            return;
        }
        update.updated_at = new Date().toISOString();
        const { data, error } = await supabase.from('projects').update(update).eq('id', projectId).select('*').single();
        if (error) throw error;
        res.json(data);
    } catch (e) {
        next(e.status ? e : { status: 400, detail: e.message || 'Failed to update project' });
    }
});

router.delete('/:project_id', getTokenFromHeader, verifyAuthToken, async (req, res, next) => {
    try {
        const projectId = req.params.project_id;
        await checkProjectAccess(projectId, req.user.username, true);
        await supabase.from('projects').delete().eq('id', projectId);
        res.status(204).send();
    } catch (e) {
        next(e.status ? e : { status: 400, detail: e.message || 'Failed to delete project' });
    }
});

router.post('/:project_id/team', getTokenFromHeader, verifyAuthToken, async (req, res, next) => {
    try {
        const projectId = req.params.project_id;
        await checkProjectAccess(projectId, req.user.username, true);
        const { username, role } = req.body || {};
        if (!username) { next({ status: 400, detail: 'Username is required' }); return; }
        const { data: existing } = await supabase
            .from('team_members')
            .select('*')
            .eq('project_id', projectId)
            .eq('username', username);
        if (existing && existing.length > 0) {
            const member = existing[0];
            const { data } = await supabase
                .from('team_members')
                .update({ role })
                .eq('id', member.id)
                .select('*')
                .single();
            res.status(201).json(data);
            return;
        }
        const now = new Date().toISOString();
        const { data, error } = await supabase
            .from('team_members')
            .insert({ project_id: projectId, username, role, assigned_at: now })
            .select('*')
            .single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (e) {
        next(e.status ? e : { status: 400, detail: e.message || 'Failed to add team member' });
    }
});

router.delete('/:project_id/team/:member_id', getTokenFromHeader, verifyAuthToken, async (req, res, next) => {
    try {
        const projectId = req.params.project_id;
        await checkProjectAccess(projectId, req.user.username, true);
        const memberId = req.params.member_id;
        await supabase.from('team_members').delete().eq('id', memberId);
        res.status(204).send();
    } catch (e) {
        next(e.status ? e : { status: 400, detail: e.message || 'Failed to remove team member' });
    }
});

router.get('/:project_id/team', getTokenFromHeader, verifyAuthToken, async (req, res, next) => {
    try {
        const projectId = req.params.project_id;
        await checkProjectAccess(projectId, req.user.username);
        const { data } = await supabase.from('team_members').select('*').eq('project_id', projectId);
        res.json((data || []).map(m => ({ ...m })));
    } catch (e) {
        next(e.status ? e : { status: 400, detail: e.message || 'Failed to fetch team' });
    }
});

router.get('/:project_id/stats', getTokenFromHeader, verifyAuthToken, async (req, res, next) => {
    try {
        const projectId = req.params.project_id;
        const username = req.user.username;
        const { data: project } = await supabase.from('projects').select('*').eq('id', projectId).maybeSingle();
        if (!project) throw { status: 404, detail: `Project ${projectId} not found` };
        await checkProjectAccess(projectId, username);
        const { data: tasks } = await supabase.from('tasks').select('*').eq('project_id', projectId);
        const statusCounts = { todo: 0, in_progress: 0, completed: 0 };
        const priorityCounts = { low: 0, medium: 0, high: 0 };
        (tasks || []).forEach(t => {
            const s = t.status || 'todo';
            const p = t.priority || 'medium';
            if (statusCounts[s] !== undefined) statusCounts[s] += 1;
            if (priorityCounts[p] !== undefined) priorityCounts[p] += 1;
        });
        const { data: members } = await supabase.from('team_members').select('*').eq('project_id', projectId);
        res.json({
            project_id: projectId,
            project_name: project.name,
            total_tasks: (tasks || []).length,
            tasks_by_status: statusCounts,
            tasks_by_priority: priorityCounts,
            team_member_count: (members || []).length,
            progress: project.progress,
            status: project.status
        });
    } catch (e) {
        next(e.status ? e : { status: 400, detail: e.message || 'Failed to get stats' });
    }
});

export default router;


