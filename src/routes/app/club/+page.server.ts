import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, parent }) => {
    if (!locals.user) redirect(303, "/login");

    const parentData = await parent();

    return {
        user: parentData.user,
        userClubs: parentData.userClubs ?? [],
    };
};
