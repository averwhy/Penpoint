import type { IncomingMessage } from "node:http";
import type { User } from "~/server/utils/models";
import { usePostgres } from "~/server/utils/postgres";

export type Context = {
	req?: IncomingMessage;
	user: User | null;
	auth?: string | null;
};

export async function createContext({ req }: { req?: IncomingMessage }) {
	const rawAuth = req?.headers?.authorization;
	const token =
		typeof rawAuth === "string" ? rawAuth.replace(/^Bearer\s+/i, "") : null;

	const user = token ? await getUserFromToken(token) : null;

	return { req, user, auth: token };
}

async function getUserFromToken(token: string): Promise<User | null> {
	const sql = usePostgres();
	// TODO
	return null;
}
