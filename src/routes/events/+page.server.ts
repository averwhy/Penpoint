import type { PageServerLoad } from "./$types";
import type { Semester, EventPageResponse, Event } from "$lib/models";
import { getMostRecentSemesterIncludingActive, sql } from "$lib/server/postgres";
import type postgres from "postgres";

export const load: PageServerLoad = async () => {    
    const semester: Semester = await getMostRecentSemesterIncludingActive();
    const semesterEnd = new Date(semester.ends);

    const result = await sql`
        SELECT 
            e.id,
            e.club_id,
            e.semester_id,
            e.name,
            e.location,
            e.point_value,
            e.starts_at,
            e.ends_at,
            e.created_at,
            e.updated_at,
            c.name AS club_name
        FROM events e
        JOIN clubs c ON e.club_id = c.id
        WHERE e.ends_at > now()
        AND e.starts_at < ${semesterEnd}
        ORDER BY e.starts_at
    `;
    
    const events: EventPageResponse[] = result.map(row => ({
        event: {
            id: row.id,
            club_id: row.club_id,
            semester_id: row.semester_id,
            name: row.name,
            location: row.location,
            point_value: row.point_value,
            starts_at: row.starts_at,
            ends_at: row.ends_at,
            created_at: row.created_at,
            updated_at: row.updated_at,
        },
        club_name: row.club_name
    }));

    return { data: events };
}