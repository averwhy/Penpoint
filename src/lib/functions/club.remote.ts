import { sql } from "$lib/server/postgres";
import { Club } from "$lib/models";
import { query } from "$app/server";
import { getRequestEvent } from "$app/server";
import { error } from "@sveltejs/kit";
import { clubOrAbove } from "$lib/utils/permissions";
import z from "zod";

export const getClub = query(z.string(), async (clubId) => {
    const event = getRequestEvent();
    if (!event.locals.user) {
        error(401, "Unauthorized");
    }

    if (!clubOrAbove(event.locals.user.role)) {
        error(403, "Forbidden");
    }
    const result = await sql`
            SELECT *
            FROM clubs
            WHERE id = ${clubId}
            LIMIT 1
        `;

    return Club.parse(result.at(0));
});

export const getClubFromUser = query(z.string(), async (userId) => {
    const event = getRequestEvent();
    if (!event.locals.user) {
        error(401, "Unauthorized");
    }

    if (!clubOrAbove(event.locals.user.role)) {
        error(403, "Forbidden");
    }
    const result = await sql`
            SELECT c.*
            FROM clubs c
            JOIN club_users cu ON c.id = cu.club_id
            WHERE cu.user_id = ${userId}
            LIMIT 1
        `;
    if (result.length === 0) return undefined;
    return Club.parse(result.at(0));
});