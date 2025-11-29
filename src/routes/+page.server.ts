import type { Semester } from "$lib/models";
import { getMostRecentSemesterIncludingActive, sql } from "$lib/server/postgres";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
    let semester: Semester;
    try {
        semester = await getMostRecentSemesterIncludingActive();
    }
    catch {
        return { pointEarners: undefined, pointsEarned: undefined, upcomingEvents: undefined, daysLeft: undefined };
    }

    const [pointEarnersResult, pointsEarnedResult, upcomingEventsResult] = await Promise.all([
        sql`
            SELECT COUNT(DISTINCT t.student_id)
            FROM taps t
            JOIN events e ON t.event_id = e.id
            WHERE e.semester_id = ${semester.id}
        `,
        sql`
            SELECT SUM(e.point_value) as total_points
            FROM taps t
            JOIN events e ON t.event_id = e.id
            WHERE e.semester_id = ${semester.id}
        `,
        sql`
            SELECT COUNT(*)
            FROM events
            WHERE starts_at > now() AND starts_at < ${semester.ends}
        `,
    ]);

    const pointEarners = Number(pointEarnersResult[0]?.count ?? 0);
    const pointsEarned = Number(pointsEarnedResult[0]?.total_points ?? 0);
    const upcomingEvents = Number(upcomingEventsResult[0]?.count ?? 0);

    const now = new Date();
    const semesterEnd = new Date(semester.ends);
    const daysLeft = Math.ceil((semesterEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return { pointEarners, pointsEarned, upcomingEvents, daysLeft };
};
