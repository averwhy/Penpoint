import { env } from "$env/dynamic/private";
import z from "zod";

export const privateEnv = z
    .object({
        /** Postgres connection string. */
        DATABASE_URL: z.url(),
        /** JWT access token secrets. */
        JWT_ACCESS_SECRET: z.string(),
        /** JWT onboarding token secrets. */
        JWT_ONBOARDING_SECRET: z.string(),
        /** JWT reset password token secrets. */
        JWT_RESET_PASSWORD_SECRET: z.string(),
        /** Runtime environment. Currently only changes whether secure cookies are used. */
        NODE_ENV: z.enum(["development", "production", "test"]),
        /** If the specified user does not exist on startup, it will be created with the specified email and `PENPOINT_INIT_PASSWORD`. */
        PENPOINT_INIT_EMAIL: z.string().optional(),
        /** If the specified user does not exist on startup, it will be created with the specified password and `PENPOINT_INIT_USERNAME`. */
        PENPOINT_INIT_PASSWORD: z.string().optional(),
        /** Email address outgoing emails will be sent from. */
        SMTP_FROM_ADDRESS: z.email().optional(),
        /** SMTP host. */
        SMTP_HOST: z.string().optional(),
        /** SMTP password. */
        SMTP_PASSWORD: z.string().optional(),
        /** SMTP port. */
        SMTP_PORT: z.coerce.number().optional().default(587),
        /** SMTP username. */
        SMTP_USERNAME: z.string().optional(),
    })
    .transform(env => {
        const {
            JWT_ACCESS_SECRET,
            JWT_ONBOARDING_SECRET,
            JWT_RESET_PASSWORD_SECRET,
            PENPOINT_INIT_EMAIL,
            PENPOINT_INIT_PASSWORD,
            SMTP_FROM_ADDRESS,
            SMTP_HOST,
            SMTP_PASSWORD,
            SMTP_PORT,
            SMTP_USERNAME,
            ...rest
        } = env;

        return {
            ...rest,
            ...{
                jwtSecrets: {
                    access: JWT_ACCESS_SECRET,
                    onboarding: JWT_ONBOARDING_SECRET,
                    resetPassword: JWT_RESET_PASSWORD_SECRET,
                },
            },
            ...(PENPOINT_INIT_EMAIL && PENPOINT_INIT_PASSWORD
                ? { PENPOINT_INIT: { email: PENPOINT_INIT_EMAIL, password: PENPOINT_INIT_PASSWORD } }
                : {}),
            ...(SMTP_FROM_ADDRESS && SMTP_HOST && SMTP_PASSWORD && SMTP_USERNAME
                ? {
                      smtp: {
                          from: SMTP_FROM_ADDRESS,
                          host: SMTP_HOST,
                          password: SMTP_PASSWORD,
                          port: SMTP_PORT,
                          username: SMTP_USERNAME,
                      },
                  }
                : {}),
        };
    })
    .parse(env);
