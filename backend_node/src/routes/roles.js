import { Router } from 'express';
import { supabase } from '../utils/supabase.js';
import { getTokenFromHeader, verifyAuthToken } from '../utils/middleware.js';
import { getUserRoleInProject, isProjectOwner, isProjectMember, Role } from '../utils/permissions.js';

const router = Router({ mergeParams: true });

async function verifyProjectExists(projectId) {
    const { data: project } = await supabase.from('projects').select('*').eq('id', projectId).maybeSingle();
    if (!project) throw { status: 404, detail: `Project ${projectId} not found` };
    return project;
}

function validateRole(role) {
    const valid = [Role.OWNER, Role.MANAGER, Role.DEVELOPER, Role.VIEWER];
    if (!valid.includes(String(role).toLowerCase())) {
        throw { status: 400, detail: `Invalid role: ${role}` };
    }
}

router.post('', getTokenFromHeader, verifyAuthToken, async (req, res, next) => {
    try {
        const projectId = req.params.project_id;
        const project = await verifyProjectExists(projectId);
        const owner = await isProjectOwner(req.user.username, projectId);
        if (!owner) { next({ status: 403, detail: 'This action requires permission: add team members (owner only)' }); return; }
        const { username, role } = req.body || {};
        validateRole(role);
        if (username === project.owner_id) { next({ status: 400, detail: 'Project owner is already a member by default' }); return; }
        const { data: existing } = await supabase
            .from('team_members')
            .select('*')
            .eq('project_id', projectId)
            .eq('username', username);
        if (existing && existing.length > 0) {
            const member = existing[0];
            const { data } = await supabase.from('team_members').update({ role }).eq('id', member.id).select('*').single();
            res.status(201).json(data);
            return;
        }
        const now = new Date().toISOString();
        const { data } = await supabase
            .from('team_members')
            .insert({ project_id: projectId, username, role, assigned_at: now })
            .select('*')
            .single();
        res.status(201).json(data);
    } catch (e) {
        next(e.status ? e : { status: 400, detail: e.message || 'Failed to add/update member' });
    }
});

router.get('', getTokenFromHeader, verifyAuthToken, async (req, res, next) => {
    try {
        const projectId = req.params.project_id;
        await verifyProjectExists(projectId);
        const member = await isProjectMember(req.user.username, projectId);
        if (!member) { next({ status: 401, detail: "You don't have access to this project" }); return; }
        const { data } = await supabase.from('team_members').select('*').eq('project_id', projectId);
        res.json((data || []).map(m => ({ ...m })));
    } catch (e) {
        next(e.status ? e : { status: 400, detail: e.message || 'Failed to get team' });
    }
});

router.put('/:username', getTokenFromHeader, verifyAuthToken, async (req, res, next) => {
    try {
        const projectId = req.params.project_id;
        const username = req.params.username;
        const project = await verifyProjectExists(projectId);
        const owner = await isProjectOwner(req.user.username, projectId);
        if (!owner) { next({ status: 403, detail: 'This action requires permission: update member roles (owner only)' }); return; }
        const role = (req.body || {}).role;
        validateRole(role);
        if (username === project.owner_id) { next({ status: 400, detail: "Cannot change the project owner's role" }); return; }
        const { data: members } = await supabase
            .from('team_members')
            .select('*')
            .eq('project_id', projectId)
            .eq('username', username);
        if (!members || members.length === 0) { next({ status: 404, detail: `User '${username}' is not a member of this project` }); return; }
        const member = members[0];
        const { data } = await supabase.from('team_members').update({ role }).eq('id', member.id).select('*').single();
        res.json(data);
    } catch (e) {
        next(e.status ? e : { status: 400, detail: e.message || 'Failed to update role' });
    }
});

router.delete('/:username', getTokenFromHeader, verifyAuthToken, async (req, res, next) => {
    try {
        const projectId = req.params.project_id;
        const username = req.params.username;
        const project = await verifyProjectExists(projectId);
        const owner = await isProjectOwner(req.user.username, projectId);
        if (!owner) { next({ status: 403, detail: 'This action requires permission: remove team members (owner only)' }); return; }
        if (username === project.owner_id) { next({ status: 400, detail: 'Cannot remove project owner' }); return; }
        const { data: members } = await supabase
            .from('team_members')
            .select('*')
            .eq('project_id', projectId)
            .eq('username', username);
        if (!members || members.length === 0) { next({ status: 404, detail: `User '${username}' is not a member of this project` }); return; }
        const member = members[0];
        await supabase.from('team_members').delete().eq('id', member.id);
        res.status(204).send();
    } catch (e) {
        next(e.status ? e : { status: 400, detail: e.message || 'Failed to remove member' });
    }
});

router.get('/:username', getTokenFromHeader, verifyAuthToken, async (req, res, next) => {
    try {
        const projectId = req.params.project_id;
        const username = req.params.username;
        await verifyProjectExists(projectId);
        const member = await isProjectMember(req.user.username, projectId);
        if (!member) { next({ status: 401, detail: "You don't have access to this project" }); return; }
        const { data: members } = await supabase
            .from('team_members')
            .select('*')
            .eq('project_id', projectId)
            .eq('username', username);
        if (!members || members.length === 0) { next({ status: 404, detail: `User '${username}' is not a member of this project` }); return; }
        res.json(members[0]);
    } catch (e) {
        next(e.status ? e : { status: 400, detail: e.message || 'Failed to get member' });
    }
});

router.get('/:username/permissions', getTokenFromHeader, verifyAuthToken, async (req, res, next) => {
    try {
        const projectId = req.params.project_id;
        const username = req.params.username;
        await verifyProjectExists(projectId);
        const member = await isProjectMember(req.user.username, projectId);
        if (!member) { next({ status: 401, detail: "You don't have access to this project" }); return; }
        const role = await getUserRoleInProject(username, projectId);
        if (!role) { next({ status: 404, detail: `User '${username}' is not a member of this project` }); return; }
        // Keep identical shape to Python implementation
        const rolePermissionsMap = {
            owner: Object.values(Role).includes('owner') ? Object.keys(Role) : undefined
        };
        // Compute permissions for role
        const r = String(role).toLowerCase();
        let permissions = [];
        if (r === 'owner') permissions = ['create_project','edit_project','delete_project','view_project','create_task','edit_task','delete_task','view_task','assign_task','update_task_status','manage_team','add_member','remove_member','update_role','view_analytics'];
        else if (r === 'manager') permissions = ['edit_project','view_project','create_task','edit_task','delete_task','view_task','assign_task','update_task_status','add_member','view_analytics'];
        else if (r === 'developer') permissions = ['view_project','create_task','view_task','update_task_status'];
        else if (r === 'viewer') permissions = ['view_project','view_task'];
        res.json({ username, role: r, permissions });
    } catch (e) {
        next(e.status ? e : { status: 400, detail: e.message || 'Failed to get permissions' });
    }
});

export default router;


