import type { PageServerLoad } from './$types';
import { sql } from '$lib/server/postgres';
import { Club, Event } from '$lib/models';
import { existsSync } from 'fs';
import path from 'path';
import { error, redirect } from '@sveltejs/kit';

const uploadsDir = path.join(process.cwd(), 'uploads', 'events');

export const load: PageServerLoad = async ({ params, parent }) => {
  const slug = params.slug;

  const { user, userClubs } = await parent();

  const [eventResult, clubResult] = await Promise.all([
    sql`
        SELECT *
        FROM events
        WHERE id = ${slug}
      `,
    sql`
        SELECT *
        FROM clubs
        WHERE id = (
          SELECT club_id
          FROM events
          WHERE id = ${slug}
        )
      `
  ]);

  if (eventResult.length === 0) {
    error(404, 'Event not found');
  }

  const event = Event.parse(eventResult.at(0));
  const club = Club.parse(clubResult.at(0));

  // ensure user is admin OR that they belong to the club that owns this event
  if (user.role !== 'admin' && !userClubs.some((club) => club.id === event.club_id)) {
    redirect(303, '/app/events');
  }

  let hasFlyer = false;
  if (event.image_filename) {
    const flyerPath = path.join(uploadsDir, event.image_filename);
    hasFlyer = existsSync(flyerPath);
  }

  return {
    slug,
    event,
    club,
    hasFlyer,
  };
}