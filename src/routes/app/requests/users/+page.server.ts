import { NewUser } from "$lib/models";
import { sql } from "$lib/server/postgres";
import { sgaOrAbove } from "$lib/utils/permissions";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
    const result = await sql`
        SELECT * FROM users
        WHERE users.role = 'unapproved'
    `;
    const users = result.map(row => NewUser.parse(row));

    return {
        newUserRequests: users,
    };
};
