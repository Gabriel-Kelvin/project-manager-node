import { Router } from "express";
import { getSupabaseClient } from "../shared/supabase.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

export const router = Router();

router.get("/", requireAuth, async (req, res) => {
	try {
		const role = req.user?.role || "user";
		if (!["admin", "manager"].includes(role)) {
			return res.status(403).json({ detail: "Insufficient permissions to view users" });
		}
		const supabase = getSupabaseClient();
		const { skip = 0, limit = 20, role: roleFilter } = req.query;
		let query = supabase.from("users").select("*", { count: "exact" });
		if (roleFilter) query = query.eq("role", String(roleFilter));
		const start = Number(skip);
		const end = start + Number(limit) - 1;
		query = query.range(start, end);
		const { data, error, count } = await query;
		if (error || !data) return res.status(500).json({ detail: "Failed to fetch users" });
		return res.json({ users: data, total: typeof count === "number" ? count : data.length, page: Math.floor(start / Number(limit)) + 1, per_page: Number(limit) });
	} catch (_e) {
		return res.status(500).json({ detail: "Failed to fetch users" });
	}
});

router.get("/:user_id", requireAuth, async (req, res) => {
	try {
		const { user_id } = req.params;
		const currentRole = req.user?.role || "user";
		const currentUserId = req.user?.user_id;
		if (!["admin", "manager"].includes(currentRole) && currentUserId !== user_id) {
			return res.status(403).json({ detail: "You can only view your own profile" });
		}
		const supabase = getSupabaseClient();
		const { data, error } = await supabase.from("users").select("*").eq("id", user_id).maybeSingle();
		if (error || !data) return res.status(404).json({ detail: "User not found" });
		return res.json(data);
	} catch (_e) {
		return res.status(500).json({ detail: "Failed to fetch user" });
	}
});

router.put("/:user_id/role", requireAuth, requireAdmin, async (req, res) => {
	try {
		const { user_id } = req.params;
		const { role } = req.body || {};
		const supabase = getSupabaseClient();
		const me = req.user?.user_id;
		const target = await supabase.from("users").select("*").eq("id", user_id).maybeSingle();
		if (!target.data) return res.status(404).json({ detail: "User not found" });
		if (me === user_id) return res.status(400).json({ detail: "You cannot change your own role" });
		const { data, error } = await supabase.from("users").update({ role }).eq("id", user_id).select("*").single();
		if (error || !data) return res.status(500).json({ detail: "Failed to update user role" });
		return res.json(data);
	} catch (_e) {
		return res.status(500).json({ detail: "Failed to update user role" });
	}
});

router.get("/me/profile", requireAuth, async (req, res) => {
	try {
		const supabase = getSupabaseClient();
		const user_id = req.user?.user_id;
		const { data, error } = await supabase.from("users").select("*").eq("id", user_id).maybeSingle();
		if (error || !data) return res.status(404).json({ detail: "User profile not found" });
		return res.json(data);
	} catch (_e) {
		return res.status(500).json({ detail: "Failed to fetch user profile" });
	}
});

router.put("/me/profile", requireAuth, async (req, res) => {
	try {
		const supabase = getSupabaseClient();
		const user_id = req.user?.user_id;
		const { full_name, ...rest } = req.body || {};
		const update = {};
		if (typeof full_name === "string" && full_name.trim()) update.full_name = full_name.trim();
		if (Object.keys(rest).length) {
			// ignore other fields as in FastAPI route comment
		}
		if (!Object.keys(update).length) return res.status(400).json({ detail: "No valid fields to update" });
		const { data, error } = await supabase.from("users").update(update).eq("id", user_id).select("*").single();
		if (error || !data) return res.status(500).json({ detail: "Failed to update profile" });
		return res.json(data);
	} catch (_e) {
		return res.status(500).json({ detail: "Failed to update profile" });
	}
});


