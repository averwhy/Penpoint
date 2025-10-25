import { getRequestEvent, query } from "$app/server";
import { error } from "@sveltejs/kit";

export const getPoints = query(async () => {
    const {
        locals: { user },
    } = getRequestEvent();
    if (!user) error(401, "Unauthorized");

    // TODO Replace with actual DB query
    return { points: 1000 };
});
