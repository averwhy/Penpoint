import { command, getRequestEvent } from "$app/server";
import { EventEdit } from "$lib/models";
import { db, sql } from "$lib/server/postgres";
import { sgaOrAbove } from "$lib/utils/permissions";
import { error } from "@sveltejs/kit";
import { z } from "zod";

export const edit = command(EventEdit, async ({ event_id, name, location, starts_at, ends_at }) => {
    const { locals } = getRequestEvent();
    if (!locals.user) error(401, "Unauthorized");

    const clubs = await sql`
        SELECT club_id
        FROM user_clubs
        WHERE user_id = ${locals.user.id}
    `;

    if (!sgaOrAbove(locals.user.role) || clubs.every(club => club.club_id !== event_id)) error(403, "Forbidden");

    if (!name && !location && !starts_at && !ends_at) {
        throw error(400, "At least one field must be provided for update");
    }

    const data = {
        name,
        location,
        starts_at,
        ends_at
    }

    Object.keys(data).forEach(
        // this is so buns icl ts pmo
        key => data[key as keyof typeof data] === undefined && delete data[key as keyof typeof data]
    )

    await sql`
        UPDATE events
        SET ${db(data)}
        WHERE id = ${event_id}
    `;
});

export const editPoints = command(z.object({ event_id: z.uuid(), points: z.number().min(1) }), async ({ event_id, points }) => {
    const { locals } = getRequestEvent();
    if (!locals.user) error(401, "Unauthorized");
    if (!sgaOrAbove(locals.user.role)) error(403, "Forbidden");

    await sql`
        UPDATE events
        SET points = ${points}
        WHERE id = ${event_id}
    `;
});