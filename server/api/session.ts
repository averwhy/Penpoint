import { verifyToken } from "~/server/utils/auth";
import { usePostgres } from "~/server/utils/postgres";

export default defineEventHandler(async (event) => {
	try {
		const authHeader = getHeader(event, "authorization");

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			throw createError({
				statusCode: 401,
				statusMessage: "No token provided",
			});
		}

		const token = authHeader.substring(7);
		const decoded = verifyToken(token);

		if (decoded.type !== "access") {
			throw createError({
				statusCode: 401,
				statusMessage: "Invalid token type",
			});
		}

		const sql = usePostgres();

		const users = await sql`
			SELECT u.id, u.email, u.name
			FROM users u
			WHERE u.id = ${decoded.userId} AND u.role is distinct from 'unapproved'
			`;

		if (users.length === 0) {
			throw createError({
				statusCode: 401,
				statusMessage: "User not found or inactive",
			});
		}

		return {
			user: users[0],
		};
	} catch (error) {
		throw createError({
			statusCode: 401,
			statusMessage: "Invalid token",
		});
	}
});
