import { fail, redirect, type Actions } from "@sveltejs/kit";
import path from "path";
import { sql } from "$lib/server/postgres";
import { clubOrAbove } from "$lib/utils/permissions";
import { uploadFile } from "$lib/functions/file-upload";

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

        // Validate and save file
        const filename = await uploadFile(flyerFile, eventId, "events");
        if (typeof filename !== "string") {
            // uploadFile returns an ActionFailure on error
            return filename;
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
