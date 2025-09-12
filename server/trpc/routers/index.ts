import { TRPCError } from "@trpc/server";
import { createTRPCRouter } from "~/server/trpc/init";
import {
	generateAccessToken,
	generateRefreshToken,
	verifyPassword,
} from "~/server/utils/auth";
import { loginSchema, userSchema } from "~/server/utils/models";
import { authedProcedure, rateLimitedProcedure } from "./procedures";

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

			if (users.length === 0){
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Invalid credentials"
				})
			}

			const userHash = users.at(0)?.password_hash
			const user = userSchema.parse(users.at(0));

			const isValidPassword = verifyPassword(opts.input.password, userHash);

			if (!isValidPassword){
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Invalid credentials"
				})
			}

			if (user.role === "unapproved"){
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Access denied. Please wait for approval email from SGA before logging in."
				})
			}

			const accessToken = generateAccessToken(user.id);
			const refreshToken = generateRefreshToken(user.id);

			// Update refresh token in database
			await sql`
				UPDATE users 
				SET refresh_token = ${refreshToken}, last_login = now(), updated_at = now()
				WHERE id = ${user.id}
			`;

			// TODO local storage
			
			return {
				accessToken,
				user: user
			};
		}),
});

// export type definition of API
export type AppRouter = typeof appRouter;
