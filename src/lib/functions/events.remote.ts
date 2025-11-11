import { sql, db } from "$lib/server/postgres";
import { Event } from "$lib/models";
import { query } from "$app/server";
import z from "zod";

export const getEvents = query(z.object({
    clubId: z.string().optional(),
    semesterId: z.string().optional()
}), async ({ clubId, semesterId }) => {
    let result;

    if (clubId && semesterId) {
        result = await sql`
            SELECT * FROM events 
            WHERE club_id = ${clubId} AND semester_id = ${semesterId}
        `;
    } else if (clubId) {
        result = await sql`
            SELECT * FROM events 
            WHERE club_id = ${clubId}
        `;
    } else if (semesterId) {
        result = await sql`
            SELECT * FROM events 
            WHERE semester_id = ${semesterId}
        `;
    } else {
        result = await sql`SELECT * FROM events`;
    }

    return result.map(row => Event.parse(row));
});