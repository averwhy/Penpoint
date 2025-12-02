import { privateEnv } from "$lib/env/private";
import { User } from "$lib/models";
import { hashPassword, verifyToken } from "$lib/server/auth";
import { db, sql } from "$lib/server/postgres";
import { type Handle, type ServerInit } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import fs from "fs";

export const init: ServerInit = async () => {
    if (privateEnv.PENPOINT_INIT) {
        const { email, password } = privateEnv.PENPOINT_INIT;
        const init_name = "Penny Point";
        const init_id = "0000000";
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

            if (result.length > 0) {
                console.log(
                    "Created an admin user with the email provided in the PENPOINT_INIT_EMAIL environment variable.",
                );
                // Create SGA
                const clubResult = await sql`
                    INSERT INTO clubs (id, name, acronym, governing_board)
                    VALUES (
                        '5f92e1a1-5be4-4cc3-8c96-0ff12dbf6e5a',
                        'Student Government Association',
                        'SGA',
                        true
                    )
                    ON CONFLICT DO NOTHING
                    RETURNING id
                `;
                // Assign our default user to SGA
                await sql`
                    INSERT INTO club_users (position, user_id, club_id)
                    VALUES (
                        'Pride Admin',
                        ${result[0].id},
                        ${clubResult[0].id}
                    )
                    ON CONFLICT DO NOTHING
                `;
                console.log("Created the SGA club and assigned the initial admin user.");
                // Load test data
                const file = fs.readFileSync("./src/lib/utils/testdata.sql", "utf8");
                await db.unsafe(file);
                console.log("Loaded test data");
            } else
                console.warn(
                    "A user with the email provided in the PENPOINT_INIT_EMAIL environment variable already exists.",
                );
        }

        init().catch(console.error);
    }

    if (privateEnv.smtp) console.log("SMTP is configured for outgoing emails.");
    else console.warn("SMTP is not fully configured. Outgoing emails will not be sent.");
};

export const auth = (async ({ event, resolve }) => {
    const token = event.cookies.get("authorization");

    if (token && token.startsWith("Bearer ")) {
        const payload = verifyToken(token.substring(7), "access", () => {
            event.cookies.delete("authorization", {
                path: "/",
            });
        });

        if (payload) {
            const users = await sql`
                SELECT *
                FROM users u
                WHERE u.id = ${payload.sub} AND u.role IS DISTINCT FROM 'unapproved'
                LIMIT 1
            `.catch(() => []);

            if (users.length) event.locals.user = User.parse(users[0]);
        }
    }

    return resolve(event);
}) satisfies Handle;

export const handle = sequence(auth);
