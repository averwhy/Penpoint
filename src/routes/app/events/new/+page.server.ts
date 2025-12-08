import { fail, redirect, type Actions, type RequestEvent } from "@sveltejs/kit";
import { writeFile } from "fs/promises";
import path from "path";
import { sql } from "$lib/server/postgres";
import { clubOrAbove } from "$lib/utils/permissions";

const uploadDir = path.join(process.cwd(), "uploads", "events");

const ALLOWED_TYPES = ["image/png", "image/jpg", "image/jpeg"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

function getFileExtension(mimeType: string): string {
    const extensions: Record<string, string> = {
        "image/png": ".png",
        "image/jpg": ".jpg",
        "image/jpeg": ".jpeg",
    };
    return extensions[mimeType] ?? ".bin";
}

export const actions: Actions = {
    default: async ({ request, locals }) => {
        if (!locals.user) {
            return fail(401, { message: "Unauthorized" });
        }

        if (!clubOrAbove(locals.user.role)) {
            return fail(403, { message: "Forbidden" });
        }

        const formData = await request.formData();

        // Extract form fields
        const eventId = (formData.get("id") as string) || crypto.randomUUID();
        const clubId = formData.get("clubId") as string;
        const semesterId = formData.get("semesterId") as string;
        const eventTitle = formData.get("eventTitle") as string;
        const building = formData.get("building") as string;
        const roomNumber = formData.get("roomNumber") as string | null;
        const startDateTime = formData.get("startDateTime") as string;
        const endDateTime = formData.get("endDateTime") as string;
        const flyerFile = formData.get("flyer") as File | null;

        // Validate required fields
        if (!clubId || !semesterId || !eventTitle || !building || !startDateTime || !endDateTime) {
            return fail(400, { message: "Missing required fields" });
        }

        // Validate file
        if (!flyerFile || flyerFile.size === 0) {
            return fail(400, { message: "Please upload a flyer for the event" });
        }

        if (!ALLOWED_TYPES.includes(flyerFile.type)) {
            return fail(400, {
                message: "Invalid flyer file type. Please upload a PNG, JPG, or JPEG image.",
            });
        }

        if (flyerFile.size > MAX_SIZE_BYTES) {
            return fail(400, {
                message: "Flyer file size exceeds the maximum limit of 5MB.",
            });
        }

        // Save file with proper extension
        const extension = getFileExtension(flyerFile.type);
        const filename = `${eventId}${extension}`;
        const filepath = path.join(uploadDir, filename);

        try {
            const buffer = Buffer.from(await flyerFile.arrayBuffer());
            await writeFile(filepath, buffer);
        } catch (e) {
            console.error("Failed to save flyer file:", e);
            return fail(500, { message: "Failed to save flyer file" });
        }

        // Insert into database
        const location = `${building} ${roomNumber ?? ""}`.trim();
        const startsAt = new Date(startDateTime);
        const endsAt = new Date(endDateTime);

        try {
            await sql`
                INSERT INTO events (id, club_id, semester_id, name, location, image_filename, starts_at, ends_at)
                VALUES (${eventId}, ${clubId}, ${semesterId}, ${eventTitle}, ${location}, ${filename}, ${startsAt}, ${endsAt})
            `;
        } catch (e) {
            console.error("Failed to create event:", e);
            return fail(500, { message: "Failed to create event in database" });
        }

        redirect(303, `/app/events/${eventId}`);
    },
};
