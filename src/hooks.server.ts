import { User } from "$lib/models";
import { verifyToken } from "$lib/server/auth";
import { sql } from "$lib/server/postgres";
import { error, type Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

export const auth = (async ({ event, resolve }) => {
    const token = event.cookies.get("authorization");

    if (token && token.startsWith("Bearer ")) {
        const payload = verifyToken(token.substring(7), "access", () => {
            event.cookies.delete("authorization", {
                path: "/",
            });
        });

        if (payload.type !== "access") error(401, "Invalid token type");

        const users = await sql`
            SELECT *
            FROM users u
            WHERE u.id = ${payload.sub} AND u.role IS DISTINCT FROM 'unapproved'
            LIMIT 1
        `;

        if (users.length === 0) error(401, "User not found or unapproved");

        event.locals.user = User.parse(users[0]);
    }

    return resolve(event);
}) satisfies Handle;

export const handle = sequence(auth);
