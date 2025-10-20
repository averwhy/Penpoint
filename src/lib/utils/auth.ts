import { error } from "@sveltejs/kit";
import bcrypt from "bcrypt";
import jwt, { type JwtPayload } from "jsonwebtoken";

export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 15);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}

export function generateAccessToken(userId: string): string {
    const accessSecret = process.env.JWT_ACCESS_SECRET;
    if (!accessSecret) {
        error(500, "Missing JWT_ACCESS_SECRET environment variable");
    }

    return jwt.sign({ userId, type: "access" }, accessSecret, {
        expiresIn: "15m",
    });
}

export function generateRefreshToken(userId: string): string {
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!refreshSecret) {
        error(500, "Missing JWT_REFRESH_SECRET environment variable");
    }

    return jwt.sign({ userId, type: "refresh" }, refreshSecret, {
        expiresIn: "7d",
    });
}

export function verifyToken(token: string, tokenType: "access" | "refresh" = "access"): JwtPayload {
    const secret = tokenType === "access" ? process.env.JWT_ACCESS_SECRET : process.env.JWT_REFRESH_SECRET;

    if (!secret) {
        error(500, `Missing JWT_${tokenType.toUpperCase()}_SECRET environment variable`);
    }

    try {
        const decoded = jwt.verify(token, secret) as JwtPayload;

        // Verify token type matches expected type
        if (decoded.type !== tokenType) {
            error(401, "Invalid token type");
        }

        return decoded;
    } catch {
        error(401, "Invalid or expired token");
    }
}
