import type { PageServerLoad } from './$types';
import { sql } from '$lib/server/postgres';
import { Event, Club, Tap } from '$lib/models';
import { existsSync } from 'fs';
import { error } from '@sveltejs/kit';
import path from 'path';

const uploadsDir = path.join(process.cwd(), 'uploads', 'events');

export const load: PageServerLoad = async ({ params }) => {
  const slug = params.slug;

  const [eventResult, clubResult, tapsResult] = await Promise.all([
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
    `,
    sql`
      SELECT *
      FROM taps
      WHERE event_id = ${slug}
      ORDER BY created_at ASC
    `
  ]);

  if (eventResult.length === 0) {
    error(404, 'Event not found');
  }

  const event = Event.parse(eventResult.at(0));
  const club = Club.parse(clubResult.at(0));
  const event_taps = tapsResult.map((row: unknown) => Tap.parse(row));

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
    event_taps,
  };
}