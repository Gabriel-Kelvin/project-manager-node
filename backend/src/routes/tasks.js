import { Router } from "express";
import { getSupabaseClient } from "../shared/supabase.js";
import { requireAuth } from "../middleware/auth.js";

export const router = Router();

router.get("/stats", requireAuth, async (_req, res) => {
	try {
		const supabase = getSupabaseClient();
		const { data } = await supabase.from("tasks").select("status");
		if (data && Array.isArray(data)) {
			const total = data.length;
			const pending = data.filter(t => t.status === "pending").length;
			const completed = data.filter(t => t.status === "completed").length;
			return res.json({ total, pending, completed });
		}
		return res.json({ total: 0, pending: 0, completed: 0 });
	} catch (_e) {
		return res.json({ total: 0, pending: 0, completed: 0 });
	}
});

router.get("/test", async (_req, res) => {
	const mock_tasks = [
		{
			id: "mock-task-1",
			title: "Follow up with John Doe",
			type: "call",
			due_date: "2024-10-15",
			assigned_to: "e8e7b017-4346-4ecc-b3ac-27ce5d6515c6",
			status: "pending",
			lead_id: null,
			notes: "Call to discuss project requirements",
			created_at: "2024-10-13T10:00:00Z",
			updated_at: "2024-10-13T10:00:00Z"
		}
	];
	return res.json({ tasks: mock_tasks, total: mock_tasks.length, page: 1, per_page: 20 });
});

router.get("/", requireAuth, async (req, res) => {
	try {
		const supabase = getSupabaseClient();
		const { skip = 0, limit = 20, status, type, assigned_to, lead_id, search, include_lead_info } = req.query;
		let select = "*";
		if (String(include_lead_info) === "true") {
			select = "*,leads!tasks_lead_id_fkey(name,email,company)";
		}
		let query = supabase.from("tasks").select(select, { count: "exact" });
		if (status) query = query.eq("status", String(status));
		if (type) query = query.eq("type", String(type));
		if (assigned_to) query = query.eq("assigned_to", String(assigned_to));
		if (lead_id) query = query.eq("lead_id", String(lead_id));
		if (search) {
			const s = `%${String(search).toLowerCase()}%`;
			query = query.or(`title.ilike.${s},notes.ilike.${s}`);
		}
		const start = Number(skip);
		const end = start + Number(limit) - 1;
		query = query.order("due_date", { ascending: true, nullsFirst: false }).order("created_at", { ascending: false });
		const { data, error, count } = await query;
		if (error || !data) return res.status(500).json({ detail: "Failed to fetch tasks" });
		return res.json({ tasks: data, total: typeof count === "number" ? count : data.length, page: Math.floor(start / Number(limit)) + 1, per_page: Number(limit) });
	} catch (e) {
		if (String(e).includes("Could not find the table")) {
			return res.json({ tasks: [], total: 0, page: 1, per_page: Number(req.query.limit || 20) });
		}
		return res.status(500).json({ detail: "Failed to fetch tasks" });
	}
});

router.get("/:task_id", requireAuth, async (req, res) => {
	try {
		const supabase = getSupabaseClient();
		const { task_id } = req.params;
		const { include_lead_info } = req.query;
		let select = "*";
		if (String(include_lead_info) === "true") {
			select = "*,leads!tasks_lead_id_fkey(name,email,company)";
		}
		const { data, error } = await supabase.from("tasks").select(select).eq("id", task_id).maybeSingle();
		if (error || !data) return res.status(404).json({ detail: "Task not found" });
		return res.json(data);
	} catch (_e) {
		return res.status(500).json({ detail: "Failed to fetch task" });
	}
});

router.post("/", requireAuth, async (req, res) => {
	try {
		const supabase = getSupabaseClient();
		const body = req.body || {};
		if (body.lead_id) {
			const { data: lead } = await supabase.from("leads").select("id").eq("id", body.lead_id).maybeSingle();
			if (!lead) return res.status(400).json({ detail: "Lead not found" });
		}
		const insert = {
			title: body.title,
			type: body.type,
			due_date: body.due_date || null,
			assigned_to: body.assigned_to || null,
			status: body.status,
			lead_id: body.lead_id || null,
			notes: body.notes || null,
			created_by: req.user?.user_id || null
		};
		const { data, error } = await supabase.from("tasks").insert(insert).select("*").single();
		if (error || !data) return res.status(500).json({ detail: "Failed to create task" });
		return res.json(data);
	} catch (_e) {
		return res.status(500).json({ detail: "Failed to create task" });
	}
});

router.put("/:task_id", requireAuth, async (req, res) => {
	try {
		const { task_id } = req.params;
		const supabase = getSupabaseClient();
		const exists = await supabase.from("tasks").select("*").eq("id", task_id).maybeSingle();
		if (!exists.data) return res.status(404).json({ detail: "Task not found" });
		const update = { ...req.body };
		const { data, error } = await supabase.from("tasks").update(update).eq("id", task_id).select("*").single();
		if (error || !data) return res.status(500).json({ detail: "Failed to update task" });
		return res.json(data);
	} catch (_e) {
		return res.status(500).json({ detail: "Failed to update task" });
	}
});

router.delete("/:task_id", requireAuth, async (req, res) => {
	try {
		const { task_id } = req.params;
		const supabase = getSupabaseClient();
		const { data: exists } = await supabase.from("tasks").select("*").eq("id", task_id).maybeSingle();
		if (!exists) return res.status(404).json({ detail: "Task not found" });
		await supabase.from("tasks").delete().eq("id", task_id);
		return res.json({ message: `Task '${exists.title}' deleted successfully` });
	} catch (_e) {
		return res.status(500).json({ detail: "Failed to delete task" });
	}
});

router.get("/upcoming", requireAuth, async (req, res) => {
	try {
		const supabase = getSupabaseClient();
		const days_ahead = Math.max(1, Math.min(30, Number(req.query.days_ahead || 7)));
		const today = new Date();
		const future = new Date();
		future.setDate(today.getDate() + days_ahead);
		let select = "*";
		if (String(req.query.include_lead_info) === "true") {
			select = "*,leads!tasks_lead_id_fkey(name,email,company)";
		}
		let query = supabase.from("tasks").select(select);
		query = query.gte("due_date", today.toISOString().slice(0, 10)).lte("due_date", future.toISOString().slice(0, 10));
		if (req.query.assigned_to) query = query.eq("assigned_to", String(req.query.assigned_to));
		query = query.order("due_date", { ascending: true }).order("created_at", { ascending: false });
		const { data, error } = await query;
		if (error || !data) return res.status(500).json({ detail: "Failed to fetch upcoming tasks" });
		return res.json({ tasks: data, total: data.length, days_ahead });
	} catch (_e) {
		return res.status(500).json({ detail: "Failed to fetch upcoming tasks" });
	}
});

router.get("/stats/overview", requireAuth, async (_req, res) => {
	try {
		const supabase = getSupabaseClient();
		const totalHead = await supabase.from("tasks").select("*", { count: "exact", head: true });
		const all = await supabase.from("tasks").select("status,type,due_date");
		const total_tasks = totalHead.count || 0;
		const allTasks = all.data || [];
		let pending = 0, in_progress = 0, completed = 0, cancelled = 0;
		let overdue = 0, due_today = 0, due_this_week = 0;
		const tasks_by_type = {};
		const today = new Date();
		const weekFromNow = new Date();
		weekFromNow.setDate(today.getDate() + 7);
		for (const t of allTasks) {
			if (t.status === "pending") pending++;
			else if (t.status === "in_progress") in_progress++;
			else if (t.status === "completed") completed++;
			else if (t.status === "cancelled") cancelled++;
			tasks_by_type[t.type] = (tasks_by_type[t.type] || 0) + 1;
			if (t.due_date) {
				const d = new Date(t.due_date);
				if (d < today && !["completed","cancelled"].includes(t.status)) overdue++;
				else if (d.toISOString().slice(0,10) === today.toISOString().slice(0,10)) due_today++;
				else if (d <= weekFromNow) due_this_week++;
			}
		}
		const completion_rate = total_tasks > 0 ? Number(((completed / total_tasks) * 100).toFixed(2)) : 0;
		return res.json({ total_tasks, pending_tasks: pending, in_progress_tasks: in_progress, completed_tasks: completed, cancelled_tasks: cancelled, overdue_tasks: overdue, tasks_by_type, tasks_due_today: due_today, tasks_due_this_week: due_this_week, completion_rate });
	} catch (_e) {
		return res.status(500).json({ detail: "Failed to fetch task statistics" });
	}
});

router.put("/:task_id/assign", requireAuth, async (req, res) => {
	try {
		const { task_id } = req.params;
		const { assigned_to } = req.query;
		const supabase = getSupabaseClient();
		const { data: exists } = await supabase.from("tasks").select("*").eq("id", task_id).maybeSingle();
		if (!exists) return res.status(404).json({ detail: "Task not found" });
		const { data, error } = await supabase.from("tasks").update({ assigned_to }).eq("id", task_id).select("*").single();
		if (error || !data) return res.status(500).json({ detail: "Failed to assign task" });
		return res.json({ message: `Task '${data.title}' assigned successfully` });
	} catch (_e) {
		return res.status(500).json({ detail: "Failed to assign task" });
	}
});

router.get("/lead/:lead_id", requireAuth, async (req, res) => {
	try {
		const { lead_id } = req.params;
		const supabase = getSupabaseClient();
		const lead = await supabase.from("leads").select("id").eq("id", lead_id).maybeSingle();
		if (!lead.data) return res.status(404).json({ detail: "Lead not found" });
		const { data, error } = await supabase.from("tasks").select("*").eq("lead_id", lead_id).order("due_date", { ascending: true, nullsFirst: false }).order("created_at", { ascending: false });
		if (error || !data) return res.status(500).json({ detail: "Failed to fetch tasks" });
		return res.json({ tasks: data, total: data.length, page: 1, per_page: data.length });
	} catch (_e) {
		return res.status(500).json({ detail: "Failed to fetch tasks for lead" });
	}
});


