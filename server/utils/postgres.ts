import postgres from "postgres";
import type User from "#imports";
export function usePostgres() : postgres.Sql {
	if (!process.env.POSTGRES_URL) {
		throw createError("Missing `POSTGRES_URL` environment variable");
	}
	const pgconnection = postgres(process.env.POSTGRES_URL as string, {
		//ssl: "require",
		connect_timeout: 60,

	});
	console.info("Connected to Postgres!");
	return pgconnection;
}

// export function createStudent(): User {

// }