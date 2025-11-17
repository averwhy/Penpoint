import { form, getRequestEvent } from "$app/server";
import { User } from "$lib/models";
import { sql } from "$lib/server/postgres";
import { error } from "@sveltejs/kit";
import z from "zod";

export const denyUserRequest = form(z.object({ userId: z.string() }), async ({ userId }) => {
    const { locals } = getRequestEvent();
    if (!locals.user) error(401, { message: "Unauthorized" });
    if (!["admin", "sga"].includes(locals.user.role)) error(403, { message: "Forbidden" });

    const users = await sql`
        SELECT *
        FROM users u
        WHERE u.id = ${userId}
        LIMIT 1
    `;
    if (users.length === 0) error(404, { message: "User not found." });

    const targetUser = User.parse(users[0]);
    if (targetUser.role !== "unapproved") error(403, { message: "This account has already been approved." });

    const updatedUser = await sql`
        DELETE FROM users
        WHERE id = ${targetUser.id}
    `;
    if (updatedUser.count === 0) error(500, { message: "Failed to deny user." });

    return { success: true };
});
