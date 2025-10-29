import { building } from "$app/environment";
import { privateEnv } from "$lib/env/private";
import { User } from "$lib/models";
import { hashPassword, verifyToken } from "$lib/server/auth";
import { sql } from "$lib/server/postgres";
import { error, type Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

if (!building && privateEnv.PENPOINT_INIT) {
    const { email, password } = privateEnv.PENPOINT_INIT;
    const init_name = "Penny Point";
    const init_id = '0000000';
    const init_role = "admin"; // Don't change

    async function init() {
        const hashedPassword = await hashPassword(password);

        await sql`
            INSERT INTO students (email, student_id, name)
            VALUES (
                ${email},
                ${init_id},
                ${init_name}
            )
            ON CONFLICT DO NOTHING
            RETURNING *
        `;

        const result = await sql`
            INSERT INTO users (email, student_id, name, role, password_hash, request_reason)
            VALUES (
                ${email},
                ${init_id},
                ${init_name},
                ${init_role},
                ${hashedPassword},
                'Initial Penpoint admin user.'
            )
            ON CONFLICT DO NOTHING
            RETURNING *
        `;

        if (result.length > 0)
            console.log(
                "Created an admin user with the email provided in the PENPOINT_INIT_EMAIL environment variable.",
            );
        else
            console.warn(
                "A user with the email provided in the PENPOINT_INIT_EMAIL environment variable already exists.",
            );
    }

    init().catch(console.error);
}

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
