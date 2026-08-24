import { env } from "$env/dynamic/public";
import z from "zod";

export const publicEnv = z
    .object({
        /** Origin used in outbound emails. */
        PUBLIC_BASE_URL: z.url().default("http://localhost:5173"),
        /** Cloudflare Turnstile site key. */
        PUBLIC_CF_TURNSTILE_KEY: z.string().optional(),
    })
    .transform(env => {
        const { PUBLIC_BASE_URL, PUBLIC_CF_TURNSTILE_KEY, ...rest } = env;

        return {
            BASE_URL: PUBLIC_BASE_URL,
            CF_TURNSTILE_KEY: PUBLIC_CF_TURNSTILE_KEY,
            ...rest,
        };
    })
    .parse(env);
