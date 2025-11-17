import { NewUser } from "$lib/models";
import { sql } from "$lib/server/postgres";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) redirect(303, "/login");

    if (!["admin", "sga"].includes(locals.user.role)) redirect(303, "/app");

    const result = await sql`
        SELECT * FROM users
        WHERE users.role = 'unapproved'
    `;
    const users = result.map(row => NewUser.parse(row));

    return {
        newUserRequests: users,
    };
};
