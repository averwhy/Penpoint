import { z } from "zod";
import { createTRPCRouter } from "~/server/trpc/init";

import { loginSchema } from "~/server/utils/models";
import { rateLimitedProcedure, authedProcedure } from "./procedures";

export const appRouter = createTRPCRouter({
	login: rateLimitedProcedure
		.input(
			loginSchema
		)
		.query(async (opts) => {
			const sql = usePostgres();

			const users = await sql`
				SELECT * 
				FROM users u
				WHERE u.email = ${opts.input.email}
			`;

			//todo: complete moving over from api/user.ts
			
			return {
				greeting: "hello",
			};
		}),
});

// export type definition of API
export type AppRouter = typeof appRouter;
