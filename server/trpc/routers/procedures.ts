import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create();

export const publicProcedure = t.procedure;

const rateMap = new Map<
  string,
  { count: number; windowStart: number }
>();

const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 90_000;
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_ATTEMPTS) || 10;

const rateLimitMiddleware = t.middleware(async ({ ctx, next }) => {
    // derive a key: prefer user id, fall back to IP or auth/token or 'anon'
    const ip = ctx.req?.headers["x-forwarded-for"]?.toString() ?? ctx.req?.socket?.remoteAddress;
    const key = ctx.user?.id?.toString() ?? ip ?? ctx.auth ?? "anon";

    const now = Date.now();
    const entry = rateMap.get(key);

    if (!entry || now - entry.windowStart > WINDOW_MS) {
        rateMap.set(key, { count: 1, windowStart: now });
    } else {
        if (entry.count >= MAX_REQUESTS) {
            throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Rate limit exceeded" });
        }
        entry.count += 1;
        rateMap.set(key, entry);
    }

    return next();
});

export const rateLimitedProcedure = t.procedure.use(rateLimitMiddleware);

// procedure that asserts that the user is logged in
export const authedProcedure = rateLimitedProcedure.use(async function isAuthed(opts) {
	const { ctx } = opts;

	const authHeader =
		ctx.req?.headers?.authorization ??
		(ctx.auth ? `Bearer ${ctx.auth}` : undefined);

	if (!ctx.user) { // this hits if token is unspecified or is wrong
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	return opts.next({
		ctx: {
			user: ctx.user,
		},
	});
});