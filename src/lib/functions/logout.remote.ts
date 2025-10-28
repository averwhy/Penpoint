import { form, getRequestEvent } from "$app/server";
import { privateEnv } from "$lib/env/private";
import { redirect } from "@sveltejs/kit";

export const logout = form(async () => {
    const { cookies } = getRequestEvent();

    cookies.delete("authorization", {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: privateEnv.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60,
    });

    console.log("Cookie deleted");

    redirect(303, "/app");
});
