import { form } from "$app/server";
import { PointCheck } from "$lib/models";
import { getMostRecentSemesterIncludingActive, sql } from "$lib/server/postgres";

export const getPoints = form(PointCheck, async check => {
    const semester = await getMostRecentSemesterIncludingActive();

    const points = await sql`
        SELECT SUM(e.point_value) as total_points
        FROM taps t
        JOIN events e ON t.event_id = e.id
        AND t.student_id = ${check.student_id}
        WHERE t.semester_id = ${semester.id}
    `;

    return { points: points.at(0) };
});
