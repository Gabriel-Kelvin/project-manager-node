import { Router } from "express";
import { getSupabaseClient } from "../shared/supabase.js";
import { createAccessToken } from "../shared/jwt.js";
import { requireAuth } from "../middleware/auth.js";

export const router = Router();

router.post("/signup", async (req, res) => {
	try {
		const { email, password, full_name } = req.body || {};
		if (!email || !password || !full_name) {
			return res.status(400).json({ detail: "Invalid request" });
		}
		const supabase = getSupabaseClient();
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: { data: { full_name } }
		});
		if (error) {
			if (/registered/i.test(error.message)) {
				return res.status(400).json({ detail: "User with this email already exists" });
			}
			if (/Password.*least/i.test(error.message)) {
				return res.status(400).json({ detail: "Password must be at least 6 characters" });
			}
			return res.status(500).json({ detail: "Failed to create user account" });
		}
		const user = data?.user;
		if (!user) return res.status(400).json({ detail: "Failed to create user account" });
		const tokenPayload = { user_id: user.id, email: user.email, full_name, role: "user" };
		const access_token = createAccessToken(tokenPayload);
		return res.json({ access_token, token_type: "bearer", user_id: user.id, email: user.email, full_name });
	} catch (e) {
		return res.status(500).json({ detail: "Failed to create user account" });
	}
});

router.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body || {};
		if (!email || !password) return res.status(400).json({ detail: "Invalid request" });
		const supabase = getSupabaseClient();
		const { data, error } = await supabase.auth.signInWithPassword({ email, password });
		if (error) {
			if (/Invalid login credentials/i.test(error.message)) {
				return res.status(401).json({ detail: "Invalid email or password" });
			}
			return res.status(500).json({ detail: "Authentication failed" });
		}
		const user = data?.user;
		if (!user) return res.status(401).json({ detail: "Invalid email or password" });
		const full_name = user.user_metadata?.full_name || (user.email?.split("@")[0] || "");
		const tokenPayload = { user_id: user.id, email: user.email, full_name, role: "user" };
		const access_token = createAccessToken(tokenPayload);
		return res.json({ access_token, token_type: "bearer", user_id: user.id, email: user.email, full_name });
	} catch (e) {
		return res.status(500).json({ detail: "Authentication failed" });
	}
});

router.get("/me", requireAuth, async (req, res) => {
	try {
		const current = req.user;
		return res.json({
			user_id: current.user_id,
			email: current.email,
			full_name: current.full_name,
			role: current.role || "user",
			created_at: current.created_at || "unknown"
		});
	} catch (e) {
		return res.status(500).json({ detail: "Failed to get user information" });
	}
});

router.post("/logout", requireAuth, async (_req, res) => {
	try {
		const supabase = getSupabaseClient();
		await supabase.auth.signOut();
		return res.json({ message: "Successfully logged out" });
	} catch (_e) {
		return res.json({ message: "Successfully logged out" });
	}
});

router.post("/refresh", requireAuth, async (req, res) => {
	try {
		const current = req.user;
		const tokenPayload = { user_id: current.user_id, email: current.email, full_name: current.full_name, role: current.role || "user" };
		const access_token = createAccessToken(tokenPayload);
		return res.json({ access_token, token_type: "bearer", user_id: current.user_id, email: current.email, full_name: current.full_name });
	} catch (e) {
		return res.status(500).json({ detail: "Failed to refresh token" });
	}
});


