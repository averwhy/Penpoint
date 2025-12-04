import { form, getRequestEvent } from "$app/server";
import { Student, Tap } from "$lib/models";
import { sql } from "$lib/server/postgres";
import { sgaOrAbove } from "$lib/utils/permissions";
import { error } from "@sveltejs/kit";

export const tap = form(Tap.omit({ id: true }), async ({ event_id, student_id }) => {
    const { locals } = getRequestEvent();
    if (!locals.user) error(401, { message: "Unauthorized" });
    if (!sgaOrAbove(locals.user.role)) error(403, { message: "Forbidden" });

    const [_student] = await sql`
        INSERT INTO students (student_id)
        VALUES (${student_id})
        ON CONFLICT (student_id) DO UPDATE
        SET student_id = EXCLUDED.student_id
        RETURNING *
    `;
    if (!_student) error(404, { message: "Failed to fetch student data." });

    const student = Student.parse(_student);

    const result = await sql`
        INSERT INTO taps (student_id, event_id)
        VALUES (${student_id}, ${event_id})
        ON CONFLICT (student_id, event_id) DO NOTHING
        RETURNING *
    `;
    if (result.length === 0)
        error(500, { message: `${student.name ?? student.student_id} has already been tapped for this event.` });

    return { student, tap: Tap.parse(result[0]) };
});
