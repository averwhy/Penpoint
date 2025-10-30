import { form, getRequestEvent } from "$app/server";
import { privateEnv } from "$lib/env/private";
import { redirect } from "@sveltejs/kit";
import { z } from "zod";

export const logout = form(z.any(), async () => {
    console.log("yo im gonna logout");
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
