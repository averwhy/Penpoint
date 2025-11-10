import { getMostRecentSemesterIncludingActive, sql } from "$lib/server/postgres";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) redirect(303, "/login");

    const semester = await getMostRecentSemesterIncludingActive();

    const [
        upcomingEventsResult,
        uniqueClubsHostingEventsResult,
        eventsHostedSemResult,
        pointsEarnedSemResult,
        attendanceCountSemResult,
        allEventsHostedResult,
        allPointsEarnedResult,
        allAttendanceCountResult,
    ] = await Promise.all([
        // upcoming
        sql`
            SELECT COUNT(*)
            FROM events
            WHERE starts_at > now() AND starts_at < ${semester.ends}
        `,
        sql`
            SELECT COUNT(DISTINCT(club_id))
            FROM events
            WHERE ends_at > now() AND starts_at < ${semester.ends}
        `,

        // semester specific
        sql`
            SELECT COUNT(*)
            FROM events
            WHERE starts_at < now() AND starts_at < ${semester.ends}
        `,
        sql`
            SELECT SUM(e.point_value) as total_points
            FROM taps t
            JOIN events e ON t.event_id = e.id
            WHERE e.semester_id = ${semester.id}
        `,
        sql`
            SELECT COUNT(t.id)
            FROM taps t
            JOIN events e ON t.event_id = e.id
            WHERE e.semester_id = ${semester.id}
        `,

        //all time
        sql`
            SELECT COUNT(*)
            FROM events
            WHERE starts_at < now()
        `,
        sql`
            SELECT SUM(e.point_value) as total_points
            FROM taps t
            JOIN events e ON t.event_id = e.id
        `,
        sql`
            SELECT COUNT(t.id)
            FROM taps t
            JOIN events e ON t.event_id = e.id
        `,
    ]);

    const upcomingEvents = Number(upcomingEventsResult[0]?.count ?? 0);
    const uniqueClubsHostingEvents = Number(uniqueClubsHostingEventsResult[0]?.count ?? 0);
    const eventsHostedSemester = Number(eventsHostedSemResult[0]?.count ?? 0);
    const pointsEarnedSemester = Number(pointsEarnedSemResult[0]?.total_points ?? 0);
    const attendanceCountSem = Number(attendanceCountSemResult[0]?.count ?? 0);
    const allEventsHosted = Number(allEventsHostedResult[0]?.count ?? 0);
    const allPointsEarned = Number(allPointsEarnedResult[0]?.total_points ?? 0);
    const allAttendanceCount = Number(allAttendanceCountResult[0]?.count ?? 0);

    return {
        upcomingEvents,
        uniqueClubsHostingEvents,
        eventsHostedSemester,
        pointsEarnedSemester,
        attendanceCountSem,
        allEventsHosted,
        allPointsEarned,
        allAttendanceCount,
    };
};
