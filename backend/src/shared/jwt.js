import jwt from "jsonwebtoken";
import { settings } from "./settings.js";

export function createAccessToken(payload) {
	const expSeconds = settings.jwtAccessTokenExpireMinutes * 60;
	return jwt.sign(payload, settings.jwtSecret, {
		algorithm: settings.algorithm,
		expiresIn: expSeconds
	});
}

export function verifyToken(token) {
	return jwt.verify(token, settings.jwtSecret, { algorithms: [settings.algorithm] });
}


