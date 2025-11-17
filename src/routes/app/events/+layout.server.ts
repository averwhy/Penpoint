import { sql } from "$lib/server/postgres";
import { Semester } from "$lib/models";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async () => {
    const result = await sql`
            SELECT *
            FROM semesters
            ORDER BY starts DESC;
        `;

    // return the list of parsed Semester's
    const semesters = result.map((row) => Semester.parse(row));
    return { semesters };
};