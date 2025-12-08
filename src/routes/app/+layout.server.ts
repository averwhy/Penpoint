import { Club } from "$lib/models";
import { sql } from "$lib/server/postgres";
import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
    if (!locals.user) redirect(303, "/login");

    const userClub = await sql`
        SELECT clubs.*
        FROM clubs
        INNER JOIN club_users ON clubs.id = club_users.club_id
        WHERE club_users.user_id = ${locals.user.id}
    `;

    return {
        user: locals.user!,
        userClubs: userClub.map((club) => Club.parse(club)),
    };
};
