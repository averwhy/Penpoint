import { z } from "zod";
import { usePostgres } from "~/server/utils/postgres";
import { hashPassword } from "~/server/utils/auth";
import { registerSchema } from "../utils/schemas";

import { studentExists, createStudent } from "~/server/utils/postgres";

export default defineEventHandler(async (event) => {
	try {
		const body = await readBody(event);
		const { name, email, password, studentid, reason} = registerSchema.parse(body);

		const sql = usePostgres();

		
		if (!studentExists(Number.parseInt(studentid))) {
			createStudent(Number.parseInt(studentid))
		}

		const password_hash = await hashPassword(password);

		// createUser() // TODO

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
