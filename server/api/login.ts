import { ZodError } from "zod";
import {
	generateAccessToken,
	generateRefreshToken,
	verifyPassword,
} from "~/server/utils/auth";
import { usePostgres } from "~/server/utils/postgres";
import { loginSchema, userSchema } from "~/server/utils/models";

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

		const users = await sql`
			SELECT * 
			FROM users u
			WHERE u.email = ${email}
		`;

		if (users.length === 0) {
			// No users found at all
			throw createError({
				statusCode: 401,
				statusMessage: "Invalid credentials",
			});
		}

		let user = users[0];
		const isValidPassword = await verifyPassword(password, user.password_hash);

		if (!isValidPassword) {
			// Wrong password
			throw createError({
				statusCode: 401,
				statusMessage: "Invalid credentials",
			});
		}

		if (user["role"] === "unapproved") {
			// Not approved to login yet
			throw createError({
				statusCode: 403,
				statusMessage:
					"Access denied. Please wait for approval email before logging in.",
			});
		}

		// Generate tokens
		const accessToken = generateAccessToken(user.id);
		const refreshToken = generateRefreshToken(user.id);

		// Update refresh token in database
		const result = await sql`
			UPDATE users 
			SET refresh_token = ${refreshToken}, last_login = now()
			WHERE id = ${user.id}
			RETURNING *
		`;

		const parsedUser = userSchema.parse(result.at(0));

		// Set HTTP-only cookie for refresh token
		setCookie(event, "refresh-token", refreshToken, {
			httpOnly: true,
			secure: true,
			sameSite: "strict",
			maxAge: 60 * 60 * 24 * 7, // 7 days
			path: "/", // Explicit path
		});

		return {
			accessToken,
			user: parsedUser,
		};
	} catch (error) {
		if (error instanceof ZodError) {
			throw createError({
				statusCode: 400,
				statusMessage: `Validation Error: ${error}`,
			});
		}
		throw error;
	}
});
