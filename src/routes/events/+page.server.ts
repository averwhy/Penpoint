import type { PageServerLoad } from "./$types";
import type { Semester, Event } from "$lib/models";
import { getMostRecentSemesterIncludingActive, sql } from "$lib/server/postgres";
import { existsSync } from "fs";
import path from "path";

const uploadsDir = path.join(process.cwd(), "uploads", "events");

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
            e.image_filename,
            e.permalink,
            e.starts_at,
            e.ends_at,
            e.created_at,
            e.updated_at,
            c.name AS club_name,
            c.acronym AS club_acronym
        FROM events e
        JOIN clubs c ON e.club_id = c.id
        WHERE e.ends_at > now()
        AND e.starts_at < ${semesterEnd}
        ORDER BY e.starts_at
    `;
    
    const events = result.map(row => {
        // Check if flyer file exists
        let hasFlyer = false;
        if (row.image_filename) {
            const flyerPath = path.join(uploadsDir, row.image_filename);
            hasFlyer = existsSync(flyerPath);
        }

        return {
            event: {
                id: row.id,
                club_id: row.club_id,
                semester_id: row.semester_id,
                name: row.name,
                location: row.location,
                point_value: row.point_value,
                image_filename: row.image_filename,
                permalink: row.permalink,
                approval_status: row.approval_status,
                starts_at: row.starts_at,
                ends_at: row.ends_at,
                created_at: row.created_at,
                updated_at: row.updated_at,
            },
            club_name: row.club_name,
            club_acronym: row.club_acronym,
            hasFlyer,
        };
    });

    return { data: events };
}