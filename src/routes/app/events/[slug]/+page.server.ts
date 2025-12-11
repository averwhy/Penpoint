import type { PageServerLoad } from './$types';
import { sql } from '$lib/server/postgres';
import { Event } from '$lib/models';
import { existsSync } from 'fs';
import path from 'path';

const uploadsDir = path.join(process.cwd(), 'uploads', 'events');

export const load: PageServerLoad = async ({ params }) => {
  const slug = params.slug;

  const result = await sql`
    SELECT 
      e.*,
      c.name AS club_name,
      c.acronym AS club_acronym
    FROM events e
    JOIN clubs c ON e.club_id = c.id
    WHERE e.id = ${slug}
  `;

  const row = result.at(0);
  const event = Event.parse(row);

  let hasFlyer = false;
  if (row?.image_filename) {
    const flyerPath = path.join(uploadsDir, row.image_filename);
    hasFlyer = existsSync(flyerPath);
  }

  return {
    slug,
    event,
    clubName: row?.club_name,
    clubAcronym: row?.club_acronym,
    hasFlyer,
  };
}