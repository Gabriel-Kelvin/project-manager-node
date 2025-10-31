import { verifyToken } from "../shared/jwt.js";

export function requireAuth(req, res, next) {
	try {
		const auth = req.headers["authorization"] || "";
		const parts = auth.split(" ");
		if (parts.length !== 2 || parts[0] !== "Bearer") {
			return res.status(401).json({ detail: "Not authenticated" });
		}
		const token = parts[1];
		const payload = verifyToken(token);
		req.user = payload;
		return next();
	} catch (err) {
		if (err && err.name === "TokenExpiredError") {
			return res.status(401).json({ detail: "Token has expired" });
		}
		if (err && (err.name === "JsonWebTokenError" || err.name === "NotBeforeError")) {
			return res.status(401).json({ detail: "Invalid token" });
		}
		return res.status(500).json({ detail: "Token verification failed" });
	}
}

export function requireRoles(...allowed) {
	return function roleGuard(req, res, next) {
		if (!req.user) return res.status(401).json({ detail: "Not authenticated" });
		const userRole = req.user.role || "user";
		if (!allowed.includes(userRole)) {
			return res.status(403).json({ detail: `Access denied. Required roles: ${allowed.join(", ")}` });
		}
		return next();
	};
}

export const requireAdmin = requireRoles("admin");
export const requireManagerOrAdmin = requireRoles("manager", "admin");


