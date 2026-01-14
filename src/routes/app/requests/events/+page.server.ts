import { sql } from "$lib/server/postgres";
import type { PageServerLoad } from "./$types";
import { Event } from "$lib/models";

export const load: PageServerLoad = async ({ locals }) => {
    const eventsResult = await sql`
        SELECT *
        FROM events
        WHERE approval_status = 'unapproved'
        ORDER BY updated_at DESC
    `;

    const eventRequests = eventsResult.map(eRow => {
        return Event.parse(eRow);
    });

    return {
        eventRequests,
    };
};