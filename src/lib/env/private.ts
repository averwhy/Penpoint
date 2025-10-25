import { env } from "$env/dynamic/private";
import z from "zod";

export const privateEnv = z
    .object({
        DATABASE_URL: z.url(),
        JWT_ACCESS_SECRET: z.string(),
        NODE_ENV: z.enum(["development", "production", "test"]),
    })
    .parse(env);
