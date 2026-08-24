import { privateEnv } from "$lib/env/private";
import { Semester, User, WalletPass } from "$lib/models";
import { error } from "@sveltejs/kit";
import postgres from "postgres";

export const db = postgres(privateEnv.DATABASE_URL, {
    //ssl: "require",
    connect_timeout: 60,
});

export const sql = async (...args: Parameters<typeof db>) => {
    try {
        return await db(...args);
    } catch (err: unknown) {
        const e = err as any;
        const isConnRefused =
            err instanceof AggregateError
                ? Array.isArray(err.errors) && err.errors.some((inner: any) => inner?.code === "ECONNREFUSED")
                : e?.code === "ECONNREFUSED" || String(e?.message).includes("ECONNREFUSED");

        if (isConnRefused) error(503, { message: "Backend unavailable" });
        throw err;
    }
};

export async function getActiveSemester(getNextIfNone = false): Promise<Semester | undefined> {
    const result = await sql`
        SELECT *
        FROM semesters
        WHERE NOW() BETWEEN starts AND ends
        ORDER BY starts DESC
        LIMIT 1
    `;

    if (result.count === 0 && getNextIfNone) {
        // No active semester, get the next one
        const fallback = await sql`
            SELECT *
            FROM semesters
            WHERE starts > NOW()
            ORDER BY starts ASC
            LIMIT 1
        `;
        if (fallback.count === 0) {
            return undefined;
        }
        return Semester.parse(fallback[0]);
    }
    else if (result.count !== 0) {
        return Semester.parse(result[0]);
    }
    else {
        return undefined;
    }
}

export async function getNextSemester(): Promise<Semester | undefined> {
    const result = await sql`
        SELECT *
        FROM semesters
        WHERE starts > NOW()
        ORDER BY starts ASC
        LIMIT 1
    `;

    if (result.count === 0) {
        return undefined;
    }

    return Semester.parse(result[0]);
}

export async function getLastSemester(): Promise<Semester | undefined> {
    // Get the most recent semester that has ended
    const result = await sql`
        SELECT *
        FROM semesters
        WHERE ends < NOW()
        ORDER BY ends DESC
        LIMIT 1
    `;

    if (result.count === 0) {
        return undefined;
    }

    return Semester.parse(result[0]);
}

export async function createUser(
    email: string,
    name: string,
    role = "student",
    password_hash?: string,
): Promise<User> {
    const result = await sql`
        INSERT INTO users (email, name, role, password_hash)
        VALUES (${email}, ${name}, ${role}, ${password_hash ?? null})
        RETURNING *
	`;

    return User.parse(result[0]);
}

export async function updateUserPassword(email: string, password_hash: string) {
    await sql`
        UPDATE users 
        SET password_hash = ${password_hash}
        WHERE email = ${email}
    `;
}

export async function userExists(email: string): Promise<boolean> {
    const result = await sql`
        SELECT student_id
        FROM users
        WHERE email = ${email}
        LIMIT 1
	`;

    return result.count === 1;
}

export function generatePassId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from(crypto.getRandomValues(new Uint8Array(10)))
        .map(b => chars[b % chars.length])
        .join('');
};

/// Returns an active pass from the database for a given user ID, or undefined if none exists
export async function getPassFromUserId(userId: string): Promise<WalletPass | undefined> {
    const result = await sql`
        SELECT wp.id FROM wallet_passes wp
        JOIN users u ON wp.user_id = u.id
        WHERE u.id = ${userId}
        LIMIT 1
    `;

    if (result.count === 0) {
        return undefined;
    }

    return WalletPass.parse(result[0]);
};

/// Internally creates a pass and returns the WalletPass object. This does not generate the actual pass file.
export async function createPass(userId: string, variant: 'apple' | 'google', expiresAt: Date): Promise<WalletPass> {
    const passId = generatePassId();
    const result = await sql`
        INSERT INTO wallet_passes (user_id, public_id, variant, expires_at)
        VALUES (${userId}, ${passId}, ${variant}, ${expiresAt})
        RETURNING *
    `;

    return WalletPass.parse(result[0]);
}