import { form } from "$app/server";
import { PointCheck } from "$lib/models";
import { getActiveSemester, getLastSemester, sql } from "$lib/server/postgres";
import { error } from "@sveltejs/kit";

export const getPoints = form(PointCheck, async check => {
    let semester = await getActiveSemester(false);
    if (!semester) {
        semester = await getLastSemester();
        if (!semester) {
            throw error(404, "No semesters found");
        }    
    }

    const points = await sql`
        SELECT COALESCE(SUM(e.point_value), 0) as total_points
        FROM taps t
        JOIN events e ON t.event_id = e.id
        WHERE t.student_id = ${check.student_id}
        AND e.semester_id = ${semester.id}
    `;
    return { points: Number.parseInt(points.at(0)?.total_points) };
});