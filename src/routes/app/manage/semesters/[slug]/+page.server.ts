import type { PageServerLoad } from "./$types";
import { sql } from "$lib/server/postgres";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params, parent }) => {
    const slug = params.slug;
    const { semesters } = await parent();

    const semester = semesters.find((s) => s.id === slug);
    if (!semester) {
        error(404, "Semester not found");
    }

    const now = new Date();
    const isActive = now >= semester.starts && now <= semester.ends;
    const hasEnded = now > semester.ends;

    const [
        eventCountResult,
        acceptedEventsResult,
        totalPointsResult,
        uniqueStudentsResult,
        totalTapsResult,
        clubCountResult,
    ] = await Promise.all([
        sql`SELECT count(*) AS count FROM events WHERE semester_id = ${slug}`,
        sql`SELECT count(*) AS count FROM events WHERE semester_id = ${slug} AND approval_status = 'accepted'`,
        sql`
            SELECT coalesce(sum(e.point_value), 0)::int AS total
            FROM taps t
            JOIN events e ON t.event_id = e.id
            WHERE e.semester_id = ${slug}
        `,
        sql`
            SELECT count(DISTINCT t.student_id)::int AS count
            FROM taps t
            JOIN events e ON t.event_id = e.id
            WHERE e.semester_id = ${slug}
        `,
        sql`
            SELECT count(*)::int AS count
            FROM taps t
            JOIN events e ON t.event_id = e.id
            WHERE e.semester_id = ${slug}
        `,
        sql`
            SELECT count(DISTINCT club_id)::int AS count
            FROM events
            WHERE semester_id = ${slug}
        `,
    ]);

    return {
        semester,
        isActive,
        hasEnded,
        stats: {
            totalEvents: eventCountResult[0].count,
            acceptedEvents: acceptedEventsResult[0].count,
            totalPointsEarned: totalPointsResult[0].total,
            uniqueStudents: uniqueStudentsResult[0].count,
            totalTaps: totalTapsResult[0].count,
            clubsParticipating: clubCountResult[0].count,
        },
    };
};