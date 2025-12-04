import { form } from "$app/server";
import PenmenPride from "$lib/assets/penmenpride.png?inline";
import { publicEnv } from "$lib/env/public";
import { User } from "$lib/models";
import { generateResetPasswordToken } from "$lib/server/auth";
import { sendEmail } from "$lib/server/email";
import { sql } from "$lib/server/postgres";
import z from "zod";

export const requestPasswordReset = form(z.object({ email: z.email() }), async ({ email }) => {
    const [_user] = await sql`
        UPDATE users
        SET password_reset_last_requested_at = now()
        WHERE email = ${email}
        AND (password_reset_last_requested_at IS NULL
            OR password_reset_last_requested_at < (now() - INTERVAL '15 minutes'))
        RETURNING *;
    `;

    // Don't error here - do not reveal whether the email exists
    if (!_user) return {};

    const user = User.parse(_user);

    sendEmail({
        to: email,
        subject: "Reset your Penmen Pride password",
        html: `
<img src="${PenmenPride}" alt="Penmen Pride Logo" style="display:block; width:120px; height:auto;">
<h1>Reset your Penmen Pride password</h1>
<p>To reset your password, click the link below and enter a new password.</p>
<p>This link will expire in 15 minutes.</p>
<a href="${publicEnv.BASE_URL}/reset-password/${generateResetPasswordToken(user.id)}">Reset Password</a>
<p>If you did not request this email, please ignore it.</p>`,
    })
        .then(() => {
            console.log(`Sent password reset email to ${email}`);
        })
        .catch(console.error);

    return {};
});
