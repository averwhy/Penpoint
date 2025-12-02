import { env } from "$env/dynamic/public";
import z from "zod";

export const publicEnv = z
    .object({
        /** Origin used in outbound emails. */
        PUBLIC_BASE_URL: z.url().default("http://localhost:5173"),
    })
    .transform(env => {
        const { PUBLIC_BASE_URL, ...rest } = env;

        return {
            BASE_URL: PUBLIC_BASE_URL,
            ...rest,
        };
    })
    .parse(env);
