import { Router } from "express";
import { getSupabaseClient } from "../shared/supabase.js";
import { requireAuth } from "../middleware/auth.js";

export const router = Router();

router.get("/stats", requireAuth, async (_req, res) => {
	try {
		const supabase = getSupabaseClient();
		const { data } = await supabase.from("deals").select("stage,value");
		if (data && Array.isArray(data)) {
			const total = data.length;
			const total_value = data.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
			const closed_won = data.filter(d => d.stage === "closed_won").length;
			return res.json({ total, total_value, closed_won });
		}
		return res.json({ total: 0, total_value: 0, closed_won: 0 });
	} catch (_e) {
		return res.json({ total: 0, total_value: 0, closed_won: 0 });
	}
});

router.get("/", requireAuth, async (req, res) => {
	try {
		const supabase = getSupabaseClient();
		const { skip = 0, limit = 20, stage, assigned_to, lead_id, search, include_lead_info } = req.query;
		let select = "*";
		if (String(include_lead_info) === "true") {
			select = "*,leads!deals_lead_id_fkey(name,email,company)";
		}
		let query = supabase.from("deals").select(select, { count: "exact" });
		if (stage) query = query.eq("stage", String(stage));
		if (assigned_to) query = query.eq("assigned_to", String(assigned_to));
		if (lead_id) query = query.eq("lead_id", String(lead_id));
		if (search) {
			const s = `%${String(search).toLowerCase()}%`;
			query = query.or(`title.ilike.${s},notes.ilike.${s}`);
		}
		const start = Number(skip);
		const end = start + Number(limit) - 1;
		query = query.order("created_at", { ascending: false }).range(start, end);
		const { data, error, count } = await query;
		if (error || !data) return res.status(500).json({ detail: "Failed to fetch deals" });
		return res.json({ deals: data, total: typeof count === "number" ? count : data.length, page: Math.floor(start / Number(limit)) + 1, per_page: Number(limit) });
	} catch (_e) {
		return res.status(500).json({ detail: "Failed to fetch deals" });
	}
});

router.get("/:deal_id", requireAuth, async (req, res) => {
	try {
		const supabase = getSupabaseClient();
		const { deal_id } = req.params;
		const { include_lead_info } = req.query;
		let select = "*";
		if (String(include_lead_info) === "true") {
			select = "*,leads!deals_lead_id_fkey(name,email,company)";
		}
		const { data, error } = await supabase.from("deals").select(select).eq("id", deal_id).maybeSingle();
		if (error || !data) return res.status(404).json({ detail: "Deal not found" });
		return res.json(data);
	} catch (_e) {
		return res.status(500).json({ detail: "Failed to fetch deal" });
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
			value: Number(body.value ?? 0),
			stage: body.stage,
			close_date: body.close_date || null,
			lead_id: body.lead_id || null,
			assigned_to: body.assigned_to || null,
			notes: body.notes || null,
			created_by: req.user?.user_id || null
		};
		const { data, error } = await supabase.from("deals").insert(insert).select("*").single();
		if (error || !data) return res.status(500).json({ detail: "Failed to create deal" });
		return res.json(data);
	} catch (_e) {
		return res.status(500).json({ detail: "Failed to create deal" });
	}
});

router.put("/:deal_id", requireAuth, async (req, res) => {
	try {
		const { deal_id } = req.params;
		const supabase = getSupabaseClient();
		const exists = await supabase.from("deals").select("*").eq("id", deal_id).maybeSingle();
		if (!exists.data) return res.status(404).json({ detail: "Deal not found" });
		const update = { ...req.body };
		if (update.value != null) update.value = Number(update.value);
		const { data, error } = await supabase.from("deals").update(update).eq("id", deal_id).select("*").single();
		if (error || !data) return res.status(500).json({ detail: "Failed to update deal" });
		return res.json(data);
	} catch (_e) {
		return res.status(500).json({ detail: "Failed to update deal" });
	}
});

router.delete("/:deal_id", requireAuth, async (req, res) => {
	try {
		const { deal_id } = req.params;
		const supabase = getSupabaseClient();
		const { data: exists } = await supabase.from("deals").select("*").eq("id", deal_id).maybeSingle();
		if (!exists) return res.status(404).json({ detail: "Deal not found" });
		await supabase.from("deals").delete().eq("id", deal_id);
		return res.json({ message: `Deal '${exists.title}' deleted successfully` });
	} catch (_e) {
		return res.status(500).json({ detail: "Failed to delete deal" });
	}
});

router.put("/:deal_id/assign", requireAuth, async (req, res) => {
	try {
		const { deal_id } = req.params;
		const { assigned_to } = req.query;
		const supabase = getSupabaseClient();
		const { data: exists } = await supabase.from("deals").select("*").eq("id", deal_id).maybeSingle();
		if (!exists) return res.status(404).json({ detail: "Deal not found" });
		const { data, error } = await supabase.from("deals").update({ assigned_to }).eq("id", deal_id).select("*").single();
		if (error || !data) return res.status(500).json({ detail: "Failed to assign deal" });
		return res.json({ message: `Deal '${data.title}' assigned successfully` });
	} catch (_e) {
		return res.status(500).json({ detail: "Failed to assign deal" });
	}
});

router.get("/lead/:lead_id", requireAuth, async (req, res) => {
	try {
		const { lead_id } = req.params;
		const supabase = getSupabaseClient();
		const lead = await supabase.from("leads").select("id").eq("id", lead_id).maybeSingle();
		if (!lead.data) return res.status(404).json({ detail: "Lead not found" });
		const { data, error } = await supabase.from("deals").select("*").eq("lead_id", lead_id).order("created_at", { ascending: false });
		if (error || !data) return res.status(500).json({ detail: "Failed to fetch deals" });
		return res.json({ deals: data, total: data.length, page: 1, per_page: data.length });
	} catch (_e) {
		return res.status(500).json({ detail: "Failed to fetch deals for lead" });
	}
});

router.get("/stats/overview", requireAuth, async (_req, res) => {
	try {
		const supabase = getSupabaseClient();
		const totalHead = await supabase.from("deals").select("*", { count: "exact", head: true });
		const all = await supabase.from("deals").select("value,stage");
		const total_deals = totalHead.count || 0;
		const allDeals = all.data || [];
		const total_value = allDeals.reduce((sum, d) => sum + Number(d.value || 0), 0);
		const stages = ["prospecting","qualification","proposal","negotiation","closed_won","closed_lost"]; 
		const deals_by_stage = {};
		const deals_by_stage_value = {};
		let closed_won_value = 0;
		let closed_lost_value = 0;
		for (const s of stages) {
			const stageDeals = allDeals.filter(d => d.stage === s);
			const stageValue = stageDeals.reduce((sum, d) => sum + Number(d.value || 0), 0);
			deals_by_stage[s] = stageDeals.length;
			deals_by_stage_value[s] = stageValue;
			if (s === "closed_won") closed_won_value = stageValue;
			if (s === "closed_lost") closed_lost_value = stageValue;
		}
		const totalClosed = closed_won_value + closed_lost_value;
		const win_rate = totalClosed > 0 ? Number(((closed_won_value / totalClosed) * 100).toFixed(2)) : 0;
		const average_deal_value = total_deals > 0 ? total_value / total_deals : 0;
		return res.json({ total_deals, total_value, deals_by_stage, deals_by_stage_value, closed_won_value, closed_lost_value, win_rate, average_deal_value });
	} catch (_e) {
		return res.status(500).json({ detail: "Failed to fetch deal statistics" });
	}
});


