import { query } from '$app/server';
import { usePostgres, getMostRecentSemesterIncludingActive } from '$lib/utils/postgres';

export const getHomepageData = query(async () => {
    const sql = usePostgres();

    const semester = await getMostRecentSemesterIncludingActive();

    const pointEarnersResult = await sql`
        SELECT UNIQUE(student_id)
        FROM taps
        WHERE semester_id = ${semester.id}
    `;
    const pointEarners = pointEarnersResult.at(0);


    const pointsEarnedResult = await sql`
        SELECT SUM(e.point_value) as total_points
        FROM taps t
        JOIN events e ON t.event_id = e.id
        WHERE t.semester_id = ${semester.id}
    `;
    const pointsEarned = pointsEarnedResult.at(0);

    const upcomingEventsResult = await sql`
        SELECT COUNT(*)
        FROM events
        WHERE starts_at > now() AND starts_at < ${semester.ends}
    `;
    const upcomingEvents = upcomingEventsResult.at(0)

    const now = new Date();
    const semesterEnd = new Date(semester.ends);
    const daysLeft = Math.ceil((semesterEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return [pointEarners, pointsEarned, upcomingEvents, daysLeft];
})