import postgres from "postgres";

export function usePostgres() {
	if (!process.env.POSTGRES_URL) {
		throw createError("Missing `POSTGRES_URL` environment variable");
	}

	return postgres(process.env.POSTGRES_URL as string, {
		ssl: "require",
	});
}
