import type { LayoutServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load: LayoutServerLoad = async ({ locals }) => {
    if (!locals.user) redirect(303, "/login");

    return {
        user: locals.user!
    };
}
