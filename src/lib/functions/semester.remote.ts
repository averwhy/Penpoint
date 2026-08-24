import { form } from "$app/server";
import { NewSemester } from "$lib/models";
import { sql } from "$lib/server/postgres";

export const createSemester = form(NewSemester, async sem => {
    // Implementation for creating a semester
    await sql`INSERT INTO semesters (starts, ends, code) VALUES (${sem.starts}, ${sem.ends}, ${sem.code})`;
    return { success: true };
});