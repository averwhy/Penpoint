import type { PageServerLoad } from './$types';
import { sql } from '$lib/server/postgres';
import { User } from '$lib/models';

export const load: PageServerLoad = async ({ params }) => {
  const slug = params.slug;

  const result = await sql`
    SELECT *
    FROM users 
    WHERE id = ${slug}
  `;

  const user = User.parse(result.at(0));

  return {
    slug,
    matchedUser: user,
  };
}