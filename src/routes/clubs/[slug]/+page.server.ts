import type { PageServerLoad } from './$types';
import { sql } from '$lib/server/postgres';
import { Club } from '$lib/models';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
  const slug = params.slug;

  const clubResult = await sql`
    SELECT *
    FROM clubs
    WHERE LOWER(acronym) = LOWER(${slug})
    LIMIT 1
  `;
  if (clubResult.length === 0) {
    error(404, 'Club not found');
  }
  const club = Club.parse(clubResult.at(0));

  const [membersResult, eventsTotal, semestersActive, attendanceTotal] = await Promise.all([
    sql`
      SELECT COUNT(u.name) AS member_count
      FROM users u
      JOIN club_users cu ON u.id = cu.user_id
      WHERE cu.club_id = ${club.id}
    `,
    sql`
      SELECT COUNT(e.id) AS event_count
      FROM events e
      WHERE e.club_id = ${club.id}
    `,
    sql`
      SELECT COUNT(DISTINCT semester_id) AS active_semesters
      FROM events
      WHERE club_id = ${club.id}
    `,
    sql`
      SELECT COUNT(t.id) AS attendance_count
      FROM taps t
      JOIN events e ON t.event_id = e.id
      WHERE e.club_id = ${club.id}
    `
  ]);

  const members = membersResult.at(0)?.member_count;
  const events = eventsTotal.at(0)?.event_count;
  const semesters = semestersActive.at(0)?.active_semesters;
  const attendance = attendanceTotal.at(0)?.attendance_count;

  return { slug, club: club, members: Number.parseInt(members), events: Number.parseInt(events), semesters: Number.parseInt(semesters), attendance: Number.parseInt(attendance) };
}