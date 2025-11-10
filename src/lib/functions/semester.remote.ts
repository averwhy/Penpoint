import { sql } from "$lib/server/postgres";
import { Semester } from "$lib/models";
import { query } from "$app/server";

export const getSemesters = query(async () => {
    const result = await sql`
            SELECT *
            FROM semesters
            ORDER BY starts DESC;
        `;

    // return the list of parsed Semester's
    return result.map((row) => Semester.parse(row));
});