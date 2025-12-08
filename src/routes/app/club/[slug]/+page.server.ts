import type { PageServerLoad } from './$types';
import { sql } from '$lib/server/postgres';
import { Club } from '$lib/models';

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
    SELECT u.name, u.role
    FROM users u
    JOIN club_users cu ON u.id = cu.user_id
    WHERE cu.club_id = ${club.id}
  `;
  const members = membersResult;

  return { slug, club: club, members: members };
}