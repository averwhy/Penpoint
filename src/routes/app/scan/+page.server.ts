import { Event } from "$lib/models";
import { getMostRecentSemesterIncludingActive, sql } from "$lib/server/postgres";
import { sgaOrAbove } from "$lib/utils/permissions";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) redirect(303, "/app/login");
    if (!sgaOrAbove(locals.user.role)) redirect(303, "/app");

    const semester = await getMostRecentSemesterIncludingActive();
    if (!semester) return { events: [] as Event[] };

    const upcomingEvents = await sql`
        SELECT * FROM events
        WHERE semester_id = ${semester.id}
        AND approval_status = 'accepted'
        ORDER BY starts_at ASC
    `;

    return { events: upcomingEvents.map(event => Event.parse(event)) };
};
