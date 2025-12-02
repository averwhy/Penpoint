import { form, getRequestEvent } from "$app/server";
import PenmenPride from "$lib/assets/penmenpride.png?inline";
import { publicEnv } from "$lib/env/public";
import { User } from "$lib/models";
import { generateOnboardingToken } from "$lib/server/auth";
import { sendEmail } from "$lib/server/email";
import { sql } from "$lib/server/postgres";
import { error } from "@sveltejs/kit";
import z from "zod";

export const approveUserRequest = form(
    z.object({ userId: z.string(), role: User.shape.role.extract(["admin", "club", "sga"]) }),
    async ({ userId, role }) => {
        const { locals } = getRequestEvent();
        if (!locals.user) error(401, { message: "Unauthorized" });
        if (!["admin", "sga"].includes(locals.user.role)) error(403, { message: "Forbidden" });

        if (role === "admin" && locals.user.role !== "admin")
            error(403, { message: "Only admins can approve other admins." });

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
            UPDATE users
            SET role = ${role}, pending = TRUE, updated_at = now()
            WHERE id = ${targetUser.id}
            RETURNING *
        `;
        if (updatedUser.count === 0) error(500, { message: "Failed to approve user." });

        sendEmail({
            html: `
                <img src="${PenmenPride}" alt="Penmen Pride Logo" style="display:block; width:120px; height:auto;">
                <h1>Your Penmen Pride Account has been approved!</h1>
                <p>Congratulations! Your account has been approved by the Student Government Association.</p>
                <p>Please click the link below to activate your account and set your password:</p>
                <a href="${publicEnv.BASE_URL}/onboarding/${generateOnboardingToken(targetUser.id)}">Activate Account</a>
                <p>If you did not request this account, please ignore this email.</p>
            `,
            subject: "Activate your Penmen Pride Account",
            to: targetUser.email,
        })
            .then(() => {
                console.log(`Sent approval email to ${targetUser.email}`);
            })
            .catch(console.error);

        return {
            user: User.parse(updatedUser[0]),
        };
    },
);
