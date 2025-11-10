import { sql } from "$lib/server/postgres";
import { Club } from "$lib/models";
import { query } from "$app/server";
import z from "zod";

export const getClubFromUser = query(z.string(), async (userId) => {
    const result = await sql`
            SELECT clubs.*
            FROM clubs
            INNER JOIN club_users ON clubs.id = club_users.club_id
            WHERE club_users.user_id = ${userId}
            LIMIT 1
        `;
    if (result.length == 0) return undefined;
    return Club.parse(result.at(0));
});
