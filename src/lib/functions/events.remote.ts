import { sql } from "$lib/server/postgres";
import { Event } from "$lib/models";
import { getRequestEvent, query } from "$app/server";
import { error } from "@sveltejs/kit";
import { clubOrAbove } from "$lib/utils/permissions";
import { getActiveSemester } from "$lib/server/postgres";
import z from "zod";

export const getEvents = query(z.object({
    clubId: z.string().optional(),
    semesterId: z.string().optional(),
    limit: z.number().default(1000),
    status: z.enum(["pending", "accepted", "rejected"]).optional()
}), async ({ clubId, semesterId, limit, status }) => {
    const event = getRequestEvent();
    if (!event.locals.user) {
        error(401, "Unauthorized");
    }

    if (!clubOrAbove(event.locals.user.role)) {
        error(403, "Forbidden");
    }

    let result;

    if (clubId && semesterId) {
        result = status
            ? await sql`
                SELECT * FROM events 
                WHERE club_id = ${clubId} 
                AND semester_id = ${semesterId}
                AND approval_status = ${status}
                ORDER BY starts_at DESC
                LIMIT ${limit}
            `
            : await sql`
                SELECT * FROM events 
                WHERE club_id = ${clubId} 
                AND semester_id = ${semesterId}
                ORDER BY starts_at DESC
                LIMIT ${limit}
            `;
    } else if (clubId) {
        result = status
            ? await sql`
                SELECT * FROM events 
                WHERE club_id = ${clubId}
                AND approval_status = ${status}
                ORDER BY starts_at DESC
                LIMIT ${limit}
            `
            : await sql`
                SELECT * FROM events 
                WHERE club_id = ${clubId}
                ORDER BY starts_at DESC
                LIMIT ${limit}
            `;
    } else if (semesterId) {
        result = status
            ? await sql`
                SELECT * FROM events 
                WHERE semester_id = ${semesterId}
                AND approval_status = ${status}
                ORDER BY starts_at DESC
                LIMIT ${limit}
            `
            : await sql`
                SELECT * FROM events 
                WHERE semester_id = ${semesterId}
                ORDER BY starts_at DESC
                LIMIT ${limit}
            `;
    } else {
        result = status
            ? await sql`SELECT * FROM events WHERE approval_status = ${status} ORDER BY starts_at DESC LIMIT ${limit}`
            : await sql`SELECT * FROM events ORDER BY starts_at DESC LIMIT ${limit}`;
    }

    return result.map(row => Event.parse(row));
});

export const pendingEvents = query(async () => {
    const event = getRequestEvent();
    if (!event.locals.user) {
        error(401, "Unauthorized");
    }

    if (!clubOrAbove(event.locals.user.role)) {
        error(403, "Forbidden");
    }

    const semester = await getActiveSemester(false);
    if (!semester) {
        return false;
    }
    const result = await sql`SELECT * FROM events WHERE approval_status = 'unapproved'`;
    const pendingEvents = result.map(row => Event.parse(row));
    return pendingEvents.length > 0;
});

export const getEventConflicts = query(z.object({
    eventId: z.string(),
}), async ({ eventId }) => {
    const event = getRequestEvent();
    if (!event.locals.user) {
        error(401, "Unauthorized");
    }

    if (!clubOrAbove(event.locals.user.role)) {
        error(403, "Forbidden");
    }

    const result = await sql`SELECT starts_at, ends_at, semester_id FROM events WHERE id = ${eventId}`;
    if (result.length === 0) {
        error(404, "Event not found");
    }
    const { starts_at, ends_at, semester_id } = result[0];
    const conflicts = await sql`
        SELECT id, name, starts_at, ends_at FROM events 
        WHERE semester_id = ${semester_id}
        AND id != ${eventId}
        AND approval_status != 'denied'
        AND (
            (starts_at < ${ends_at} AND ends_at > ${starts_at})
        )
    `;
    return conflicts.map(row => Event.pick({ id: true, name: true, starts_at: true, ends_at: true }).parse(row));
});