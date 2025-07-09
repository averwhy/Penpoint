import bcrypt from "bcrypt";
import jwt, { type JwtPayload } from "jsonwebtoken";

export async function hashPassword(password: string): Promise<string> {
	return await bcrypt.hash(password, 10);
}

export async function verifyPassword(
	password: string,
	hash: string,
): Promise<boolean> {
	return await bcrypt.compare(password, hash);
}

export function generateAccessToken(userId: string): string {
	const accessSecret = process.env.JWT_ACCESS_SECRET;
	if (!accessSecret) {
		throw createError("Missing JWT_ACCESS_SECRET environment variable");
	}

	return jwt.sign({ userId, type: "access" }, accessSecret, {
		expiresIn: "15m",
	});
}

export function generateRefreshToken(userId: string): string {
	const refreshSecret = process.env.JWT_REFRESH_SECRET;
	if (!refreshSecret) {
		throw createError("Missing JWT_REFRESH_SECRET environment variable");
	}

	return jwt.sign({ userId, type: "refresh" }, refreshSecret, {
		expiresIn: "7d",
	});
}

export function verifyToken(
	token: string,
	tokenType: "access" | "refresh" = "access",
): JwtPayload {
	const secret =
		tokenType === "access"
			? process.env.JWT_ACCESS_SECRET
			: process.env.JWT_REFRESH_SECRET;

	if (!secret) {
		throw createError(
			`Missing JWT_${tokenType.toUpperCase()}_SECRET environment variable`,
		);
	}

	try {
		const decoded = jwt.verify(token, secret) as JwtPayload;

		// Verify token type matches expected type
		if (decoded.type !== tokenType) {
			throw createError({
				statusCode: 401,
				statusMessage: "Invalid token type",
			});
		}

		return decoded;
	} catch (error) {
		throw createError({
			statusCode: 401,
			statusMessage: "Invalid or expired token",
		});
	}
}
