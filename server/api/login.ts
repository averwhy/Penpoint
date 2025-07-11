import { loginSchema } from "~/server/utils/schemas";
import { usePostgres } from "~/server/utils/postgres";
import {
	verifyPassword,
	generateAccessToken,
	generateRefreshToken,
} from "~/server/utils/auth";
import { ZodError } from "zod";

// Simple rate limiting storage (use Redis in production)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

function checkRateLimit(ip: string): boolean {
	const now = Date.now();
	const attempts = loginAttempts.get(ip);

	if (!attempts) {
		loginAttempts.set(ip, { count: 1, lastAttempt: now });
		return true;
	}

	// Reset after 15 minutes
	if (now - attempts.lastAttempt > 15 * 60 * 1000) {
		loginAttempts.set(ip, { count: 1, lastAttempt: now });
		return true;
	}

	// Max 5 attempts per 15 minutes
	if (attempts.count >= 5) {
		return false;
	}

	attempts.count++;
	attempts.lastAttempt = now;
	return true;
}

export default defineEventHandler(async (event) => {
	// Set security headers
	setHeader(event, "X-Content-Type-Options", "nosniff");
	setHeader(event, "X-Frame-Options", "DENY");
	setHeader(event, "X-XSS-Protection", "1; mode=block");

	try {
		// Rate limiting
		const clientIP =
			getHeaders(event)["x-forwarded-for"] ||
			getHeaders(event)["x-real-ip"] ||
			"unknown";
		if (!checkRateLimit(clientIP)) {
			throw createError({
				statusCode: 429,
				statusMessage: "Too many login attempts. Please try again later.",
			});
		}

		const body = await readBody(event);
		const { email, password } = loginSchema.parse(body);

		const sql = usePostgres();

		// Find user with admin privileges
		const users = await sql`
			SELECT u.*, a.active 
			FROM users u
			WHERE u.email = ${email} AND a.active = true
		`;

		if (users.length === 0) {
			// TODO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
			// Wtf is the difference between this and the 401 below?
		}

		const user = users[0];
		const isValidPassword = await verifyPassword(password, user.password_hash);

		if (!isValidPassword) {
			throw createError({
				statusCode: 401,
				statusMessage: "Invalid credentials",
			});
		}

		// Generate tokens
		const accessToken = generateAccessToken(user.id);
		const refreshToken = generateRefreshToken(user.id);

		// Update refresh token in database
		await sql`
      UPDATE users 
      SET refresh_token = ${refreshToken}, last_login = now()
      WHERE id = ${user.id}
    `;

		// Set HTTP-only cookie for refresh token
		setCookie(event, "refresh-token", refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production", // Only HTTPS in production
			sameSite: "strict",
			maxAge: 60 * 60 * 24 * 7, // 7 days
			path: "/", // Explicit path
		});

		return {
			accessToken,
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
			},
		};
	} catch (error) {
		if (error instanceof ZodError) {
			if (error.errors[0].code === "too_small") {
				throw createError({
					statusCode: 400,
					statusMessage: `Password too short: ${error}`,
				});
			}

			// Fallback
			throw createError({
				statusCode: 400,
				statusMessage: `Invalid input data: ${error}`,
			});
		}
		throw error;
	}
});
