import { sql, db } from "$lib/server/postgres";
import { Event } from "$lib/models";
import { query } from "$app/server";
import z from "zod";

export const getEvents = query(z.object({
    clubId: z.string().optional(),
    semesterId: z.string().optional(),
    limit: z.number().default(1000)
}), async ({ clubId, semesterId, limit }) => {
    let result;

    if (clubId && semesterId) {
        result = await sql`
            SELECT * FROM events 
            WHERE club_id = ${clubId} 
            AND semester_id = ${semesterId}
            LIMIT ${limit}
        `;
    } else if (clubId) {
        result = await sql`
            SELECT * FROM events 
            WHERE club_id = ${clubId}
            LIMIT ${limit}
        `;
    } else if (semesterId) {
        result = await sql`
            SELECT * FROM events 
            WHERE semester_id = ${semesterId}
            LIMIT ${limit}
        `;
    } else {
        result = await sql`SELECT * FROM events LIMIT ${limit}`;
    }

    return result.map(row => Event.parse(row));
});

export const createEvent = query(z.object({
    clubId: z.string(),
    semesterId: z.string(),
    eventTitle: z.string(),
    building: z.string(),
    roomNumber: z.string().optional(),
    startDateTime: z.date(),
    endDateTime: z.date(),
    specialRequests: z.string().optional()
}), async ({ clubId, semesterId, eventTitle, building, roomNumber, startDateTime, endDateTime, specialRequests }) => {
    const result = await sql`
        INSERT INTO events (club_id, semester_id, event_title, building, room_number, start_date_time, end_date_time, special_requests)
        VALUES (${clubId}, ${semesterId}, ${eventTitle}, ${building}, ${roomNumber ?? ""}, ${startDateTime}, ${endDateTime}, ${specialRequests ?? ""})
        RETURNING *;
    `;

    return Event.parse(result[0]);
});