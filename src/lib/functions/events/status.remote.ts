import { command, getRequestEvent } from "$app/server";
import { Event, EventStatusUpdate } from "$lib/models";
import { sql } from "$lib/server/postgres";
import { sgaOrAbove, isAdmin } from "$lib/utils/permissions";
import { error } from "@sveltejs/kit";
import z from "zod";

export const updateEvent = command(EventStatusUpdate, async ({ event_id, approval_status }) => {
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

export const cancelEvent = command(z.object({ event_id: z.uuid() }), async ({ event_id }) => {
    const { locals } = getRequestEvent();
    if (!locals.user) error(401, "Unauthorized");
    const [eventClubResult, userClubs] = await Promise.all(
        [
            sql`
                SELECT club_id, starts_at FROM events
                WHERE id = ${event_id}
                LIMIT 1
            `,
            sql`
                SELECT club_id
                FROM club_users
                WHERE user_id = ${locals.user.id}
            `
        ]
    );
    if (eventClubResult.length === 0) error(404, "Event not found");
    const eventClubId = eventClubResult[0].club_id;
    const eventStartsAt = eventClubResult[0].starts_at;
    const role = locals.user.role;
    const hasAnyClub = userClubs.length > 0;
    const inEventClub = userClubs.some((club) => club.club_id === eventClubId);
    const isSgaPlus = sgaOrAbove(role);
    const isAdminUser = isAdmin(role);
    const eventStarted = eventStartsAt < new Date();

    if (eventStarted && !isAdminUser) error(403, "Forbidden");
    if (!inEventClub && !isSgaPlus) error(403, "Forbidden");
    if (!hasAnyClub && !isSgaPlus) error(403, "Forbidden");

    // TODO: delete flyer if exists
    await sql`
        DELETE FROM events
        WHERE id = ${event_id}
    `;
});