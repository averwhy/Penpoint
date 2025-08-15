import { usePostgres } from "~/server/utils/postgres";
import { verifyToken } from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
	try {
		const authHeader = getHeader(event, "authorization");

		if (authHeader?.startsWith("Bearer ")) {
			const token = authHeader.substring(7);
			const decoded = verifyToken(token);

			// Clear refresh token from database
			const sql = usePostgres();
			await sql`
				UPDATE users 
				SET refresh_token = NULL 
				WHERE id = ${decoded.userId}
			`;
		}

		// Clear refresh token cookie
		deleteCookie(event, "refresh-token");

		return { success: true };
	} catch (error) {
		// Even if token verification fails, we still want to clear the cookie
		deleteCookie(event, "refresh-token");
		return { success: true };
	}
});
