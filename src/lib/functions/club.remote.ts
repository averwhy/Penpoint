import { sql } from "$lib/server/postgres";
import { Club } from "$lib/models";
import { query } from "$app/server";
import z from "zod";

export const getClub = query(z.string(), async (clubId) => {
    const result = await sql`
            SELECT *
            FROM clubs
            WHERE id = ${clubId}
            LIMIT 1
        `;

    return Club.parse(result.at(0));
});
