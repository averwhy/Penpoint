import { form, getRequestEvent } from "$app/server";
import { privateEnv } from "$lib/env/private";
import { Login, User } from "$lib/models";
import { generateAccessToken, verifyPassword } from "$lib/server/auth";
import { sql } from "$lib/server/postgres";
import { error } from "@sveltejs/kit";

export const login = form(Login, async login => {
    const users = await sql`
        SELECT *
        FROM users u
        WHERE u.email = ${login.email}
        LIMIT 1
    `;

    if (users.length === 0) error(401, "Invalid credentials");

    const passwordHash = users[0]?.password_hash;
    const user = User.parse(users[0]);

    const isValidPassword = await verifyPassword(login.password, passwordHash);

    if (!isValidPassword) error(401, "Invalid credentials");

    if (user.role === "unapproved")
        error(403, "Access denied. Please wait for approval email from SGA before logging in.");

    const accessToken = generateAccessToken(user.id);

    await sql`
        UPDATE users 
        SET last_login = now(), updated_at = now()
        WHERE id = ${user.id}
    `;

    const { cookies } = getRequestEvent();

    cookies.set("authorization", `Bearer ${accessToken}`, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: privateEnv.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60,
    });

    return { user };
});
