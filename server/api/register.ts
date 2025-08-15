import { z } from "zod";
import { usePostgres } from "~/server/utils/postgres";
import { hashPassword } from "~/server/utils/auth";
import { registerSchema } from "../utils/schemas";

import { studentExists, createStudent } from "~/server/utils/postgres";

export default defineEventHandler(async (event) => {
	try {
		const body = await readBody(event);
		const result = registerSchema.safeParse(body);
		if (!result.success) {
			const errors = z.treeifyError(result.error);
			return sendError(
				event,
				createError({
					statusCode: 400,
					data: { errors },
				}),
			);
		}

		const { name, email, password, studentid, reason } = result.data;

		usePostgres();

		try {
			if (!(await studentExists(+studentid))) {
				await createStudent(+studentid);
			}
		} catch (err) {
			console.error("register error:", err);
			throw createError({ statusCode: 500 });
		}

		const password_hash = await hashPassword(password);
		// TODO: createUser()

		return { success: true };
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorMessages = JSON.parse(error.message).map(
				// biome-ignore lint/suspicious/noExplicitAny: We do NOT care
				(msg: any) => msg.message,
			);
			throw createError({
				statusCode: 400,
				statusMessage: errorMessages.join(""),
			});
		}
		throw error;
	}
});
