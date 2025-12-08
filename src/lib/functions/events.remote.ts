import { sql } from "$lib/server/postgres";
import { Event } from "$lib/models";
import { getRequestEvent, query } from "$app/server";
import { error } from "@sveltejs/kit";
import { clubOrAbove } from "$lib/utils/permissions";
import z from "zod";

export const getEvents = query(z.object({
    clubId: z.string().optional(),
    semesterId: z.string().optional(),
    limit: z.number().default(1000)
}), async ({ clubId, semesterId, limit }) => {
    const event = getRequestEvent();
    if (!event.locals.user) {
        error(401, "Unauthorized");
    }

    if (!clubOrAbove(event.locals.user.role)) {
        error(403, "Forbidden");
    }

    let result;

    if (clubId && semesterId) {
        result = await sql`
            SELECT * FROM events 
            WHERE club_id = ${clubId} 
            AND semester_id = ${semesterId}
            LIMIT ${limit}
        `;
    } else if (clubId) {
        result = await sql`
            SELECT * FROM events 
            WHERE club_id = ${clubId}
            LIMIT ${limit}
        `;
    } else if (semesterId) {
        result = await sql`
            SELECT * FROM events 
            WHERE semester_id = ${semesterId}
            LIMIT ${limit}
        `;
    } else {
        result = await sql`SELECT * FROM events LIMIT ${limit}`;
    }

    return result.map(row => Event.parse(row));
});