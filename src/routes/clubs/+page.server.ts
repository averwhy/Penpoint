import { sql } from "$lib/server/postgres";
import { Club } from "$lib/models";
import type { PageServerLoad } from "./$types";
import { isHttpError } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ locals, parent }) => {
    try {
        const clubsResult = sql`
            SELECT *
            FROM clubs
            ORDER BY name
        `;

        const clubs = (await clubsResult).map(row => Club.parse(row));

        return {
            clubs: clubs
        };
    } catch (err: unknown) {
        if (isHttpError(err, 503)) {
            return {
                clubs: null,
                unavailable: true,
            };
        }
        throw err;
    }
};
