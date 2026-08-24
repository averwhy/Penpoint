import { privateEnv } from "$lib/env/private";

export default async function validateTurnstile(turnstileToken: string, remoteIp?: string): Promise<boolean> {
    const secret = privateEnv.cfTurnstile?.secretKey;
    if (!secret || !turnstileToken) {
        return false;
    }

    const body = new URLSearchParams({
        secret,
        response: turnstileToken,
        ...(remoteIp ? { remoteip: remoteIp } : {}),
    });

    try {
        const verifyResult = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: body.toString(),
            signal: AbortSignal.timeout(10_000),
        });

        if (!verifyResult.ok) {
            return false;
        }

        const outcome: { success?: boolean } = await verifyResult.json();
        return outcome.success === true;
    } catch {
        return false;
    }
}