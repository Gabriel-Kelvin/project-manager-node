import { Router } from "express";
import { getSupabaseClient } from "../shared/supabase.js";
import { requireAuth } from "../middleware/auth.js";

export const router = Router();

router.get("/stats", requireAuth, async (_req, res) => {
	try {
		const supabase = getSupabaseClient();
		const { data } = await supabase.from("leads").select("status");
		if (data && Array.isArray(data)) {
			const total = data.length;
			const newCount = data.filter(l => l.status === "new").length;
			const qualified = data.filter(l => l.status === "qualified").length;
			return res.json({ total, new: newCount, qualified });
		}
		return res.json({ total: 0, new: 0, qualified: 0 });
	} catch (_e) {
		return res.json({ total: 0, new: 0, qualified: 0 });
	}
});

router.get("/test", async (_req, res) => {
	const mock_leads = [
		{
			id: "mock-lead-1",
			name: "John Doe",
			email: "john@example.com",
			phone: "+1234567890",
			company: "Acme Corp",
			status: "new",
			source: "website",
			notes: "Interested in our premium package",
			assigned_to: "e8e7b017-4346-4ecc-b3ac-27ce5d6515c6",
			created_at: "2024-10-13T10:00:00Z",
			updated_at: "2024-10-13T10:00:00Z"
		},
		{
			id: "mock-lead-2",
			name: "Jane Smith",
			email: "jane@example.com",
			phone: "+1234567891",
			company: "Tech Solutions",
			status: "contacted",
			source: "referral",
			notes: "Referred by existing client",
			assigned_to: "e8e7b017-4346-4ecc-b3ac-27ce5d6515c6",
			created_at: "2024-10-13T11:00:00Z",
			updated_at: "2024-10-13T11:00:00Z"
		},
		{
			id: "mock-lead-3",
			name: "Bob Johnson",
			email: "bob@example.com",
			phone: "+1234567892",
			company: "Global Inc",
			status: "qualified",
			source: "social_media",
			notes: "High priority lead",
			assigned_to: "e8e7b017-4346-4ecc-b3ac-27ce5d6515c6",
			created_at: "2024-10-13T12:00:00Z",
			updated_at: "2024-10-13T12:00:00Z"
		}
	];
	return res.json({ leads: mock_leads, total: mock_leads.length, page: 1, per_page: 20 });
});

router.post("/test", async (req, res) => {
	try {
		const supabase = getSupabaseClient();
		const body = req.body || {};
		const insert = {
			name: body.name,
			email: body.email,
			phone: body.phone,
			company: body.company,
			status: body.status,
			source: body.source,
			notes: body.notes,
			assigned_to: body.assigned_to || "e8e7b017-4346-4ecc-b3ac-27ce5d6515c6"
		};
		const { data, error } = await supabase.from("leads").insert(insert).select("*").single();
		if (error || !data) return res.status(500).json({ detail: "Failed to create lead" });
		return res.json(data);
	} catch (e) {
		return res.status(500).json({ detail: `Failed to create lead: ${String(e)}` });
	}
});

router.post("/create", async (req, res) => {
	try {
		const supabase = getSupabaseClient();
		const body = req.body || {};
		const insert = {
			name: body.name,
			email: body.email,
			phone: body.phone,
			company: body.company,
			status: body.status,
			source: body.source,
			notes: body.notes,
			assigned_to: body.assigned_to || "e8e7b017-4346-4ecc-b3ac-27ce5d6515c6"
		};
		const { data, error } = await supabase.from("leads").insert(insert).select("*").single();
		if (error || !data) return res.status(500).json({ detail: "Failed to create lead" });
		return res.json(data);
	} catch (_e) {
		return res.status(500).json({ detail: "Failed to create lead" });
	}
});

router.get("/", requireAuth, async (req, res) => {
	try {
		const supabase = getSupabaseClient();
		const { skip = 0, limit = 20, status, source, assigned_to, search } = req.query;
		let query = supabase.from("leads").select("*", { count: "exact" });
		if (status) query = query.eq("status", String(status));
		if (source) query = query.eq("source", String(source));
		if (assigned_to) query = query.eq("assigned_to", String(assigned_to));
		if (search) {
			const s = `%${String(search).toLowerCase()}%`;
			query = query.or(`name.ilike.${s},email.ilike.${s},company.ilike.${s}`);
		}
		const start = Number(skip);
		const end = start + Number(limit) - 1;
		query = query.order("created_at", { ascending: false }).range(start, end);
		const { data, error, count } = await query;
		if (error || !data) return res.status(500).json({ detail: "Failed to fetch leads" });
		return res.json({
			leads: data,
			total: typeof count === "number" ? count : data.length,
			page: Math.floor(start / Number(limit)) + 1,
			per_page: Number(limit)
		});
	} catch (e) {
		if (String(e).includes("Could not find the table")) {
			const mock = [];
			return res.json({ leads: mock, total: 0, page: 1, per_page: Number(req.query.limit || 20) });
		}
		return res.status(500).json({ detail: "Failed to fetch leads" });
	}
});

router.get("/:lead_id", requireAuth, async (req, res) => {
	try {
		const { lead_id } = req.params;
		const supabase = getSupabaseClient();
		const { data, error } = await supabase.from("leads").select("*").eq("id", lead_id).single();
		if (error || !data) return res.status(404).json({ detail: "Lead not found" });
		return res.json(data);
	} catch (_e) {
		return res.status(500).json({ detail: "Failed to fetch lead" });
	}
});

router.post("/", requireAuth, async (req, res) => {
	try {
		const supabase = getSupabaseClient();
		const body = req.body || {};
		const insert = {
			name: body.name,
			email: body.email,
			phone: body.phone,
			company: body.company,
			status: body.status,
			source: body.source,
			notes: body.notes,
			assigned_to: body.assigned_to
		};
		const { data, error } = await supabase.from("leads").insert(insert).select("*").single();
		if (error || !data) return res.status(500).json({ detail: "Failed to create lead" });
		return res.json(data);
	} catch (_e) {
		return res.status(500).json({ detail: "Failed to create lead" });
	}
});

router.put("/:lead_id", requireAuth, async (req, res) => {
	try {
		const { lead_id } = req.params;
		const supabase = getSupabaseClient();
		const update = { ...req.body };
		const { data: exists } = await supabase.from("leads").select("*").eq("id", lead_id).maybeSingle();
		if (!exists) return res.status(404).json({ detail: "Lead not found" });
		const { data, error } = await supabase.from("leads").update(update).eq("id", lead_id).select("*").single();
		if (error || !data) return res.status(500).json({ detail: "Failed to update lead" });
		return res.json(data);
	} catch (_e) {
		return res.status(500).json({ detail: "Failed to update lead" });
	}
});

router.delete("/:lead_id", requireAuth, async (req, res) => {
	try {
		const { lead_id } = req.params;
		const supabase = getSupabaseClient();
		const { data: exists } = await supabase.from("leads").select("*").eq("id", lead_id).maybeSingle();
		if (!exists) return res.status(404).json({ detail: "Lead not found" });
		await supabase.from("leads").delete().eq("id", lead_id);
		return res.json({ message: `Lead '${exists.name}' deleted successfully` });
	} catch (_e) {
		return res.status(500).json({ detail: "Failed to delete lead" });
	}
});

router.put("/:lead_id/assign", requireAuth, async (req, res) => {
	try {
		const { lead_id } = req.params;
		const { assigned_to } = req.query;
		const supabase = getSupabaseClient();
		const { data: exists } = await supabase.from("leads").select("*").eq("id", lead_id).maybeSingle();
		if (!exists) return res.status(404).json({ detail: "Lead not found" });
		const { data, error } = await supabase.from("leads").update({ assigned_to }).eq("id", lead_id).select("*").single();
		if (error || !data) return res.status(500).json({ detail: "Failed to assign lead" });
		return res.json({ message: `Lead '${data.name}' assigned successfully` });
	} catch (_e) {
		return res.status(500).json({ detail: "Failed to assign lead" });
	}
});

router.get("/stats/overview", requireAuth, async (_req, res) => {
	try {
		const supabase = getSupabaseClient();
		const { count: totalCount } = await supabase.from("leads").select("*", { count: "exact", head: true });
		const statuses = ["new", "contacted", "qualified", "closed_won", "closed_lost"]; 
		const statusCounts = {};
		for (const s of statuses) {
			const { count } = await supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", s);
			statusCounts[s] = count || 0;
		}
		const closedWon = statusCounts["closed_won"] || 0;
		const closedLost = statusCounts["closed_lost"] || 0;
		const totalClosed = closedWon + closedLost;
		const conversion_rate = totalClosed > 0 ? Number(((closedWon / totalClosed) * 100).toFixed(2)) : 0;
		return res.json({
			total_leads: totalCount || 0,
			new_leads: statusCounts["new"] || 0,
			contacted_leads: statusCounts["contacted"] || 0,
			qualified_leads: statusCounts["qualified"] || 0,
			closed_won: closedWon,
			closed_lost: closedLost,
			conversion_rate
		});
	} catch (_e) {
		return res.status(500).json({ detail: "Failed to fetch lead statistics" });
	}
});


