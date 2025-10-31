import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load env from multiple possible locations to mirror Python config behavior
const candidatePaths = [
	path.resolve(process.cwd(), ".env"),
	path.resolve(process.cwd(), "../backend/.env"),
	path.resolve(process.cwd(), "../.env"),
	path.resolve(process.cwd(), "../../.env"),
	path.resolve(process.cwd(), "../env.docker"),
	path.resolve(process.cwd(), "../../env.docker"),
	path.resolve(process.cwd(), "../docker.env"),
	path.resolve(process.cwd(), "../../docker.env")
];

for (const p of candidatePaths) {
	if (fs.existsSync(p)) {
		dotenv.config({ path: p });
		break;
	}
}

function requireEnv(varName) {
	const value = process.env[varName];
	if (!value) {
		throw new Error(`Required environment variable '${varName}' is not set`);
	}
	return value;
}

export const settings = {
	supabaseUrl: requireEnv("SUPABASE_URL"),
	supabaseKey: requireEnv("SUPABASE_KEY"),
	jwtSecret: requireEnv("JWT_SECRET"),
	algorithm: process.env.ALGORITHM || "HS256",
	jwtAccessTokenExpireMinutes: parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRE_MINUTES || "30", 10),
	appName: process.env.APP_NAME || "CRM Backend API",
	environment: process.env.ENVIRONMENT || "development",
	debug: /^(true|1|yes)$/i.test(process.env.DEBUG || "false"),
	corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:8080").split(",").map(s => s.trim())
};


