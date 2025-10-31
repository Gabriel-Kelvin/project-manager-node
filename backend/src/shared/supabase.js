import { createClient } from "@supabase/supabase-js";
import { settings } from "./settings.js";

let client = null;

export function getSupabaseClient() {
	if (!client) {
		client = createClient(settings.supabaseUrl, settings.supabaseKey);
	}
	return client;
}


