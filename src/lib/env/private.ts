import { env } from "$env/dynamic/private";
import z from "zod";

export const privateEnv = z
    .object({
        /** Postgres connection string. */
        DATABASE_URL: z.url(),
        /** JWT access token secrets. */
        JWT_ACCESS_SECRET: z.string(),
        /** If the specified user does not exist on startup, it will be created with the specified email and `PENPOINT_INIT_PASSWORD`. */
        PENPOINT_INIT_EMAIL: z.string().optional(),
        /** If the specified user does not exist on startup, it will be created with the specified password and `PENPOINT_INIT_USERNAME`. */
        PENPOINT_INIT_PASSWORD: z.string().optional(),
        /** Runtime environment. Currently only changes whether secure cookies are used. */
        NODE_ENV: z.enum(["development", "production", "test"]),
    })
    .transform(env => {
        const { PENPOINT_INIT_EMAIL, PENPOINT_INIT_PASSWORD, ...rest } = env;

        return {
            ...rest,
            ...(PENPOINT_INIT_EMAIL && PENPOINT_INIT_PASSWORD
                ? { PENPOINT_INIT: { email: PENPOINT_INIT_EMAIL, password: PENPOINT_INIT_PASSWORD } }
                : {}),
        };
    })
    .parse(env);
