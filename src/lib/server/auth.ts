import { privateEnv } from "$lib/env/private";
import bcrypt from "bcrypt";
import jwt, { type JwtPayload } from "jsonwebtoken";

export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 15);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}

export function generateAccessToken(userId: string): string {
    return jwt.sign({ sub: userId, type: "access" }, privateEnv.jwtSecrets.access, {
        expiresIn: "7d",
    });
}

export function generateOnboardingToken(userId: string): string {
    return jwt.sign({ sub: userId, type: "onboarding" }, privateEnv.jwtSecrets.onboarding, {
        expiresIn: "3d",
    });
}

export function generateResetPasswordToken(userId: string): string {
    return jwt.sign({ sub: userId, type: "resetPassword" }, privateEnv.jwtSecrets.resetPassword, {
        expiresIn: "15m",
    });
}

export function verifyToken(
    token: string,
    tokenType: "access" | "onboarding" | "resetPassword",
    deleteCookie?: () => void,
): (JwtPayload & { sub: string }) | null {
    if (tokenType !== "access" && tokenType !== "onboarding" && tokenType !== "resetPassword") return null;

    const secret = privateEnv.jwtSecrets[tokenType];

    try {
        const decoded = jwt.verify(token, secret) as JwtPayload;

        // Verify token contains a user id
        if (!decoded.sub) {
            deleteCookie?.();
            return null;
        }

        // Verify token type matches expected type
        if (decoded.type !== tokenType) {
            deleteCookie?.();
            return null;
        }

        return decoded as JwtPayload & { sub: string };
    } catch {
        deleteCookie?.();
        return null;
    }
}
