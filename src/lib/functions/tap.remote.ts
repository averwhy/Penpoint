import { form, getRequestEvent, command } from "$app/server";
import { Event, Student, Tap } from "$lib/models";
import { sql } from "$lib/server/postgres";
import { sgaOrAbove } from "$lib/utils/permissions";
import { error } from "@sveltejs/kit";

export const tap = form(Tap.omit({ id: true }), async ({ student_id, event_id }) => {
  return await submitTap(student_id, event_id);
});

export const manualTap = command(Tap.omit({ id: true }), async ({student_id, event_id}) => {
  return await submitTap(student_id, event_id);
});

async function submitTap(student_id: string, event_id: string) {
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

    const [_event] = await sql`
      SELECT *
      FROM events
      WHERE id = ${event_id}
      LIMIT 1
  `;
    if (!_event) error(404, { message: "Event not found." });

    const event = Event.parse(_event);

    if (event.approval_status !== "accepted") error(403, { message: "Cannot tap into an event that is not accepted." });

    const result = await sql`
      INSERT INTO taps (student_id, event_id)
      VALUES (${student_id}, ${event_id})
      ON CONFLICT (student_id, event_id) DO NOTHING
      RETURNING *
  `;
    if (result.length === 0)
        error(500, { message: `${student.name ?? student.student_id} has already been tapped for ${event.name}.` });

    return { student, tap: Tap.parse(result[0]) };
}
