import { User } from "$lib/models";
import { sql } from "$lib/server/postgres";
import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
    if (!locals.user) redirect(303, "/app/login");

    const result = await sql`
            SELECT *
            FROM users
            ORDER BY name DESC;
        `;

    // return the list of parsed Users's
    const users = result.map(row => User.parse(row));
    return { users };
};
