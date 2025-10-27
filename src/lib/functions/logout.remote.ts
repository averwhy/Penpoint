import { form, getRequestEvent } from "$app/server";
import { privateEnv } from "$lib/env/private";

export const login = form(async () => {
    const { cookies } = getRequestEvent();

    cookies.delete("authorization", {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: privateEnv.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60,
    });
});
