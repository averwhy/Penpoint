import { getRequestEvent, query } from "$app/server";
import { error } from "@sveltejs/kit";

export const getUser = query(async () => {
    const {
        locals: { user },
    } = getRequestEvent();
    if (!user) return undefined;

    return user;
});
