import type { PageServerLoad } from './$types';
import { sql } from '$lib/server/postgres';
import { Club, Event } from '$lib/models';
import { sgaOrAbove } from '$lib/utils/permissions';
import { uploadFile } from '$lib/functions/file-upload';
import { getUserClubs } from '$lib/functions/club.remote';
import { fail, redirect, type Actions } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params }) => {
  const slug = params.slug;

  const clubResult = await sql`
    SELECT *
    FROM clubs
    WHERE LOWER(acronym) = LOWER(${slug})
    LIMIT 1
  `;
  const club = Club.parse(clubResult.at(0));

  const membersResult = await sql`
    SELECT u.id, u.name, u.role
    FROM users u
    JOIN club_users cu ON u.id = cu.user_id
    WHERE cu.club_id = ${club.id}
  `;
  const members = membersResult;

  const clubEventsResult = await sql`
    SELECT *
    FROM events
    WHERE club_id = ${club.id}
    ORDER BY starts_at DESC
  `;
  const events = clubEventsResult.map(row => Event.parse(row));

  return { slug, club: club, members: members, events: events };
}

export const actions: Actions = {
    default: async ({ request, locals }) => {
        if (!locals.user) {
            return fail(401, { message: "Unauthorized" });
        }

        const userClubs = await getUserClubs(locals.user.id);

        const formData = await request.formData();

        // Extract form fields
        const eventId = (formData.get("id") as string) || crypto.randomUUID();
        const clubId = formData.get("clubId") as string;
        const flyerFile = formData.get("flyer") as File | null;

        if (!sgaOrAbove(locals.user.role) || (!userClubs || !userClubs.some((c) => c.id === clubId))) {
            return fail(403, { message: "Forbidden" });
        }

        // Validate and save file
        const filename = await uploadFile(flyerFile, eventId, "events");
        if (typeof filename !== "string") {
            // uploadFile returns an ActionFailure on error
            return filename;
        }

        try {
            await sql`
                UPDATE clubs
                SET image_filename = ${filename}
                WHERE id = ${clubId}
            `;
        } catch (e) {
            console.error("Failed to update club image:", e);
            return fail(500, { message: "Failed to update club image in database due to internal error" });
        }

        redirect(303, `/app/club/${eventId}`);
    },
};
