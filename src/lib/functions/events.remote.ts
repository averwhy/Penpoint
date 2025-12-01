import { sql } from "$lib/server/postgres";
import { Event } from "$lib/models";
import { getRequestEvent, query } from "$app/server";
import { error } from "@sveltejs/kit";
import { clubOrAbove } from "$lib/utils/permissions";
import z from "zod";

export const getEvents = query(z.object({
    clubId: z.string().optional(),
    semesterId: z.string().optional(),
    limit: z.number().default(1000)
}), async ({ clubId, semesterId, limit }) => {
    const event = getRequestEvent();
    if (!event.locals.user) {
        error(401, "Unauthorized");
    }

    if (!clubOrAbove(event.locals.user.role)) {
        error(403, "Forbidden");
    }

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

function validateFlyerFile(flyerFile: File, eventId: string): File {
    const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(flyerFile.type)) {
        error(400, "Invalid flyer file type. Please upload a PNG, JPG, or JPEG image.");
    }

    if (flyerFile.size > maxSizeInBytes) {
        error(400, "Flyer file size exceeds the maximum limit of 5MB.");
    }

    return new File([flyerFile], `${eventId}`, { type: flyerFile.type });
}


export const createEvent = query(z.object({
    id: z.string().optional(),
    clubId: z.string(),
    semesterId: z.string(),
    eventTitle: z.string(),
    building: z.string(),
    roomNumber: z.string().optional(),
    startDateTime: z.date(),
    endDateTime: z.date(),
    flyerFile: z.instanceof(File),
    specialRequests: z.string().optional()
}), async ({ id, clubId, semesterId, eventTitle, building, roomNumber, startDateTime, endDateTime, flyerFile, specialRequests }) => {
    const event = getRequestEvent();
    if (!event.locals.user) {
        error(401, "Unauthorized");
    }

    if (!clubOrAbove(event.locals.user.role)) {
        error(403, "Forbidden");
    }

    const location = `${building} ${roomNumber ?? ""}`.trim();
    const eventID = id ?? crypto.randomUUID();

    const finalFlyer = validateFlyerFile(flyerFile, eventID);
    // TODO: save to /static/event/{eventID}.{type}


    const result = await sql`
        INSERT INTO events (id, club_id, semester_id, name, location, starts_at, ends_at)
        VALUES (${eventID}, ${clubId}, ${semesterId}, ${eventTitle}, ${location}, ${startDateTime}, ${endDateTime})
        RETURNING *;
    `;

    return Event.parse(result[0]);
});