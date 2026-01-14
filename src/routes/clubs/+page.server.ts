import { redirect } from "@sveltejs/kit";
import { sql } from "$lib/server/postgres";
import { Club } from "$lib/models";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, parent }) => {
    const clubsResult = sql`
        SELECT *
        FROM clubs
        ORDER BY name
    `;

    const clubs = (await clubsResult).map(row => Club.parse(row));

    return {
        clubs: clubs
    };
};
