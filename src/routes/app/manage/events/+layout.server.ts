import { sql } from "$lib/server/postgres";
import { Semester } from "$lib/models";
import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
    if (!locals.user) redirect(303, "/app/login");
    if (locals.user.role !== "admin") redirect(303, "/app");
    console.log("Loading semesters for manage events layout");

    const result = await sql`
            SELECT *
            FROM semesters
            ORDER BY starts DESC;
        `;

    // return the list of parsed Semester's
    const semesters = result.map((row) => Semester.parse(row));
    return { semesters };
};