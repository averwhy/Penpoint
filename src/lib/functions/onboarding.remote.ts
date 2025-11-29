import { form } from "$app/server";
import { SetPassword, User } from "$lib/models";
import { hashPassword, verifyToken } from "$lib/server/auth";
import { sql } from "$lib/server/postgres";
import { error, redirect } from "@sveltejs/kit";

// TODO this is untested
export const setPassword = form(SetPassword, async ({ _password, token }) => {
    const payload = verifyToken(token, "onboarding");
    if (!payload) error(401, { message: "Invalid or expired onboarding token." });

    const users = await sql`
        SELECT *
        FROM users u
        WHERE u.id = ${payload.sub}
        LIMIT 1
    `;
    if (users.length === 0) error(401, { message: "Invalid credentials" });

    const user = User.parse(users[0]);
    if (!user.pending) error(403, { message: "This account has already been activated." });

    if (user.role === "unapproved")
        error(403, { message: "Access denied. Please wait for approval email from SGA before logging in." });

    if (user.role === "inactive")
        error(401, { message: "Access denied. Your account has been marked as inactive. Contact SGA for assistance." });

    const passwordHash = await hashPassword(_password);

    await sql`
        UPDATE users
        SET password_hash = ${passwordHash}, pending = false, updated_at = now()
        WHERE id = ${user.id}
    `;

    redirect(303, "/login?onboarding_success=true");
});
