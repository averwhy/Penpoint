import { z } from "zod";
import { usePostgres } from "~/server/utils/postgres";
import { hashPassword } from "~/server/utils/auth";

const passwordSchema = z
	.string()
	.min(8, "Password must be at least 8 characters.")
	.max(256, "Password must be at most 256 characters.")
	.refine((val) => /[A-Z]/.test(val), {
		message: "Password must contain at least one uppercase letter.",
	})
	.refine((val) => /[0-9]/.test(val), {
		message: "Password must contain at least one number.",
	})
	.refine((val) => /[^A-Za-z0-9].*[^A-Za-z0-9]/.test(val), {
		message: "Password must contain at least two special characters.",
	});

const registerSchema = z.object({
	email: z.string().email(),
	password: passwordSchema,
});

export default defineEventHandler(async (event) => {
	try {
		const body = await readBody(event);
		const { email, password } = registerSchema.parse(body);

		const sql = usePostgres();

		// Check if user already exists
		const existing = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;
		if (existing.length > 0) {
			throw createError({
				statusCode: 409,
				statusMessage: "An account with this email already exists.",
			});
		}

		// Hash password
		const password_hash = await hashPassword(password);

		// Insert user as pending/awaiting approval
		await sql`
			INSERT INTO users (email, password_hash)
			VALUES (${email}, ${password_hash})
			`;

		// Optionally: send notification email to admin here

		return { success: true };
	} catch (error) {
		if (error instanceof z.ZodError) {
			throw createError({
				statusCode: 400,
				statusMessage: error?.message || "Invalid input data.",
			});
		}
		throw error;
	}
});
