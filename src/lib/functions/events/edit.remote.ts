import { command, getRequestEvent } from "$app/server";
import { EventEdit, Event } from "$lib/models";
import { db, sql } from "$lib/server/postgres";
import { sgaOrAbove, isAdmin } from "$lib/utils/permissions";
import { error } from "@sveltejs/kit";
import { z } from "zod";

export const editEvent = command(EventEdit, async ({ event_id, name, location, starts_at, ends_at }) => {
    const { locals } = getRequestEvent();
    if (!locals.user) error(401, "Unauthorized");
    const [eventClubResult, userClubs] = await Promise.all(
        [
            sql`
                SELECT club_id FROM events
                WHERE id = ${event_id}
                LIMIT 1
                `,
            sql`
                SELECT club_id
                FROM user_clubs
                WHERE user_id = ${locals.user.id}
                `
        ]
    );
    if (eventClubResult.length === 0) error(404, "Event not found");
    const eventClubId = eventClubResult[0].club_id;
    const role = locals.user.role;
    const hasAnyClub = userClubs.length > 0;
    const inEventClub = userClubs.some((club) => club.club_id === eventClubId);
    const isSgaPlus = sgaOrAbove(role);

    if (!inEventClub && !isSgaPlus) error(403, "Forbidden");
    if (!hasAnyClub && !isSgaPlus) error(403, "Forbidden");

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
        SET point_value = ${points}
        WHERE id = ${event_id}
    `;
});