import { z } from "zod";
import { createUser, usePostgres, userExists } from "~/server/utils/postgres";
import { hashPassword } from "~/server/utils/auth";
import { registerSchema } from "../utils/models";

import { studentExists, createStudent } from "~/server/utils/postgres";

export default defineEventHandler(async (event) => {
	try {
		const body = await readBody(event);
		const result = registerSchema.safeParse(body);

		if (!result.success) {
			// zod schema errors are (most likely) caught here
			const errors = z.treeifyError(result.error).errors;
			return sendError(
				event,
				createError({
					statusCode: 400,
					statusMessage: "Password Validation Error",
					data: errors,
				}),
			);
		}

		const { name, email, password, studentid, reason } = result.data;

		usePostgres();

		// Making sure the 'student' exists for swiping purposes
		if (!(await studentExists(+studentid))) {
			await createStudent(+studentid);
		}

		// Create actual user now
		const password_hash = await hashPassword(password);
		if (!(await userExists(+studentid))) {
			await createUser(+studentid, email, name, reason, password_hash);
			// We're not expecting any login or refresh token since this is just an account 'request'
			// Once approved, they can login as normal
		}

		return { success: true };
	} catch (error) {
		throw createError({
			statusCode: 500,
			statusMessage: "Unexpected internal error",
			data: error,
		});
	}
});
