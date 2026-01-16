import { command, getRequestEvent } from "$app/server";
import { Event, EventStatusUpdate } from "$lib/models";
import { sql } from "$lib/server/postgres";
import { sgaOrAbove } from "$lib/utils/permissions";
import { error } from "@sveltejs/kit";

export const update = command(EventStatusUpdate, async ({ event_id, approval_status }) => {
    const { locals } = getRequestEvent();
    if (!locals.user) error(401, "Unauthorized");
    if (!sgaOrAbove(locals.user.role)) error(403, "Forbidden");

    await sql`
        UPDATE events
        SET approval_status = ${approval_status},
            updated_at = NOW()
        WHERE id = ${event_id}
    `;
});
