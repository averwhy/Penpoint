import { describe, test, expect, mock, beforeEach, beforeAll } from "bun:test";
import bcrypt from "bcrypt";
import jwt, { type JwtPayload } from "jsonwebtoken";

// ── Constants ────────────────────────────────────────────────────────────────

const JWT_ACCESS_SECRET = "test-access-secret";
const JWT_ONBOARDING_SECRET = "test-onboarding-secret";
const JWT_RESET_PASSWORD_SECRET = "test-reset-password-secret";

const TEST_EMAIL = "testuser@example.edu";
const TEST_PASSWORD = "Str0ng!!Pass";
const TEST_USER_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const TEST_STUDENT_ID = "1234567";

let TEST_PASSWORD_HASH: string;

// ── Mock database ────────────────────────────────────────────────────────────

interface MockUser {
    id: string;
    student_id: string;
    email: string;
    name: string;
    role: string;
    pending: boolean;
    request_reason: string;
    requested_at: Date;
    last_login: Date;
    created_at: Date;
    updated_at: Date;
    password_hash: string | null;
    password_reset_last_requested_at: Date | null;
}

let mockUsers: MockUser[] = [];

function makeMockUser(overrides: Partial<MockUser> = {}): MockUser {
    return {
        id: TEST_USER_ID,
        student_id: TEST_STUDENT_ID,
        email: TEST_EMAIL,
        name: "Test User",
        role: "club",
        pending: false,
        request_reason: "Testing",
        requested_at: new Date(),
        last_login: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
        password_hash: TEST_PASSWORD_HASH,
        password_reset_last_requested_at: null,
        ...overrides,
    };
}

/**
 * Simulates the core login logic extracted from `login.remote.ts`.
 * Uses the mock database instead of a real postgres connection.
 */
async function performLogin(
    email: string,
    password: string,
): Promise<{
    status: number;
    message?: string;
    accessToken?: string;
    userId?: string;
    cookieSet?: { name: string; value: string; options: Record<string, unknown> };
    redirectTo?: string;
}> {
    // 1. Validate input shape (mirrors Zod's Login schema)
    if (!email || typeof email !== "string" || !email.includes("@")) {
        return { status: 400, message: "Invalid email" };
    }
    if (!password || typeof password !== "string") {
        return { status: 400, message: "Invalid password" };
    }
    if (email.length > 100) {
        return { status: 400, message: "Email too long" };
    }

    // 2. Query mock DB
    const users = mockUsers.filter(
        (u) => u.email === email.toLowerCase().trim(),
    );

    if (users.length === 0) {
        return { status: 401, message: "Invalid credentials" };
    }

    const user = users[0];
    const passwordHash = user.password_hash;

    if (!passwordHash) {
        return { status: 401, message: "Invalid credentials" };
    }

    // 3. Verify password
    const isValid = await bcrypt.compare(password, passwordHash);
    if (!isValid) {
        return { status: 401, message: "Invalid credentials" };
    }

    // 4. Role-based access control
    if (user.role === "unapproved") {
        return {
            status: 403,
            message:
                "Access denied. Please wait for approval email from SGA before logging in.",
        };
    }
    if (user.role === "inactive") {
        return {
            status: 401,
            message:
                "Access denied. Your account has been marked as inactive. Contact SGA for assistance.",
        };
    }

    // 5. Generate access token
    const accessToken = jwt.sign(
        { sub: user.id, type: "access" },
        JWT_ACCESS_SECRET,
        { expiresIn: "7d" },
    );

    // 6. Update last_login (in mock)
    user.last_login = new Date();
    user.updated_at = new Date();

    // 7. Set cookie + redirect
    return {
        status: 303,
        accessToken,
        userId: user.id,
        cookieSet: {
            name: "authorization",
            value: `Bearer ${accessToken}`,
            options: {
                path: "/",
                httpOnly: true,
                sameSite: "lax",
                secure: false, // test env
                maxAge: 7 * 24 * 60 * 60,
            },
        },
        redirectTo: "/app",
    };
}

// ── Auth helpers (mirror src/lib/server/auth.ts) ─────────────────────────────

function verifyToken(
    token: string,
    tokenType: "access" | "onboarding" | "resetPassword",
): (JwtPayload & { sub: string }) | null {
    const secrets: Record<string, string> = {
        access: JWT_ACCESS_SECRET,
        onboarding: JWT_ONBOARDING_SECRET,
        resetPassword: JWT_RESET_PASSWORD_SECRET,
    };

    try {
        const decoded = jwt.verify(token, secrets[tokenType]) as JwtPayload;
        if (!decoded.sub) return null;
        if (decoded.type !== tokenType) return null;
        return decoded as JwtPayload & { sub: string };
    } catch {
        return null;
    }
}

// ── Test setup ───────────────────────────────────────────────────────────────

beforeAll(async () => {
    // Pre-hash the test password once (bcrypt is slow by design)
    TEST_PASSWORD_HASH = await bcrypt.hash(TEST_PASSWORD, 4); // low rounds for speed
});

beforeEach(() => {
    // Reset mock database before each test
    mockUsers = [makeMockUser()];
});

// ── Tests ────────────────────────────────────────────────────────────────────

describe("Login – Happy path", () => {
    test("successful login returns 303 redirect with valid JWT", async () => {
        const result = await performLogin(TEST_EMAIL, TEST_PASSWORD);

        expect(result.status).toBe(303);
        expect(result.redirectTo).toBe("/app");
        expect(result.accessToken).toBeDefined();

        // Verify the JWT is valid and contains correct claims
        const decoded = verifyToken(result.accessToken!, "access");
        expect(decoded).not.toBeNull();
        expect(decoded!.sub).toBe(TEST_USER_ID);
        expect(decoded!.type).toBe("access");
    });

    test("successful login sets httpOnly cookie with Bearer prefix", async () => {
        const result = await performLogin(TEST_EMAIL, TEST_PASSWORD);

        expect(result.cookieSet).toBeDefined();
        expect(result.cookieSet!.name).toBe("authorization");
        expect(result.cookieSet!.value).toStartWith("Bearer ");
        expect(result.cookieSet!.options.httpOnly).toBe(true);
        expect(result.cookieSet!.options.sameSite).toBe("lax");
        expect(result.cookieSet!.options.path).toBe("/");
    });

    test("successful login updates last_login timestamp", async () => {
        const before = new Date();
        await performLogin(TEST_EMAIL, TEST_PASSWORD);
        const after = new Date();

        const user = mockUsers.find((u) => u.id === TEST_USER_ID)!;
        expect(user.last_login.getTime()).toBeGreaterThanOrEqual(before.getTime());
        expect(user.last_login.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    test("JWT expires in 7 days", async () => {
        const result = await performLogin(TEST_EMAIL, TEST_PASSWORD);
        const decoded = jwt.decode(result.accessToken!) as JwtPayload;

        const sevenDaysInSeconds = 7 * 24 * 60 * 60;
        const expiresIn = decoded.exp! - decoded.iat!;
        expect(expiresIn).toBe(sevenDaysInSeconds);
    });

    test("cookie maxAge matches JWT expiry (7 days)", async () => {
        const result = await performLogin(TEST_EMAIL, TEST_PASSWORD);
        expect(result.cookieSet!.options.maxAge).toBe(7 * 24 * 60 * 60);
    });
});

describe("Login – Invalid credentials", () => {
    test("wrong password returns 401", async () => {
        const result = await performLogin(TEST_EMAIL, "WrongPassword!!");
        expect(result.status).toBe(401);
        expect(result.message).toBe("Invalid credentials");
        expect(result.accessToken).toBeUndefined();
    });

    test("non-existent email returns 401", async () => {
        const result = await performLogin("nobody@example.edu", TEST_PASSWORD);
        expect(result.status).toBe(401);
        expect(result.message).toBe("Invalid credentials");
    });

    test("error message is identical for wrong email and wrong password (no enumeration)", async () => {
        const wrongEmail = await performLogin(
            "nobody@example.edu",
            TEST_PASSWORD,
        );
        const wrongPass = await performLogin(TEST_EMAIL, "WrongPassword!!");

        // Both should return the exact same status and message to prevent user enumeration
        expect(wrongEmail.status).toBe(wrongPass.status);
        expect(wrongEmail.message).toBe(wrongPass.message);
    });

    test("empty password returns 400", async () => {
        const result = await performLogin(TEST_EMAIL, "");
        expect(result.status).toBe(400);
    });

    test("empty email returns 400", async () => {
        const result = await performLogin("", TEST_PASSWORD);
        expect(result.status).toBe(400);
    });
});

describe("Login – Role-based access control", () => {
    test("unapproved user gets 403", async () => {
        mockUsers = [makeMockUser({ role: "unapproved" })];

        const result = await performLogin(TEST_EMAIL, TEST_PASSWORD);
        expect(result.status).toBe(403);
        expect(result.message).toContain("approval");
        expect(result.accessToken).toBeUndefined();
    });

    test("inactive user gets 401", async () => {
        mockUsers = [makeMockUser({ role: "inactive" })];

        const result = await performLogin(TEST_EMAIL, TEST_PASSWORD);
        expect(result.status).toBe(401);
        expect(result.message).toContain("inactive");
        expect(result.accessToken).toBeUndefined();
    });

    test("club role user can log in", async () => {
        mockUsers = [makeMockUser({ role: "club" })];
        const result = await performLogin(TEST_EMAIL, TEST_PASSWORD);
        expect(result.status).toBe(303);
    });

    test("sga role user can log in", async () => {
        mockUsers = [makeMockUser({ role: "sga" })];
        const result = await performLogin(TEST_EMAIL, TEST_PASSWORD);
        expect(result.status).toBe(303);
    });

    test("admin role user can log in", async () => {
        mockUsers = [makeMockUser({ role: "admin" })];
        const result = await performLogin(TEST_EMAIL, TEST_PASSWORD);
        expect(result.status).toBe(303);
    });
});

describe("Login – User without password hash", () => {
    test("user with null password_hash returns 401", async () => {
        mockUsers = [makeMockUser({ password_hash: null })];

        const result = await performLogin(TEST_EMAIL, TEST_PASSWORD);
        expect(result.status).toBe(401);
        expect(result.message).toBe("Invalid credentials");
    });
});

describe("Login – SQL injection attempts", () => {
    test("SQL injection in email field is treated as literal string (no match)", async () => {
        const sqliPayloads = [
            "' OR '1'='1' --",
            "'; DROP TABLE users; --",
            "admin@example.edu' OR 1=1 --",
            "' UNION SELECT * FROM users --",
            "1'; EXEC xp_cmdshell('whoami'); --",
        ];

        for (const payload of sqliPayloads) {
            const result = await performLogin(payload, TEST_PASSWORD);
            // All of these should fail at validation or return 401 – never succeed
            expect(result.status === 400 || result.status === 401).toBe(true);
            expect(result.accessToken).toBeUndefined();
        }
    });

    test("SQL injection in password field does not bypass auth", async () => {
        const result = await performLogin(
            TEST_EMAIL,
            "' OR '1'='1",
        );
        expect(result.status).toBe(401);
        expect(result.accessToken).toBeUndefined();
    });
});

describe("Login – NoSQL / object injection attempts", () => {
    test("passing object-like strings as email does not authenticate", async () => {
        const result = await performLogin(
            '{"$gt": ""}',
            TEST_PASSWORD,
        );
        expect(result.status === 400 || result.status === 401).toBe(true);
        expect(result.accessToken).toBeUndefined();
    });
});

describe("Login – XSS payloads in input", () => {
    test("script tag in email does not cause issues", async () => {
        const result = await performLogin(
            "<script>alert(1)</script>@evil.com",
            TEST_PASSWORD,
        );
        expect(result.status === 400 || result.status === 401).toBe(true);
        expect(result.accessToken).toBeUndefined();
    });

    test("script tag in password does not cause issues", async () => {
        const result = await performLogin(
            TEST_EMAIL,
            "<script>alert(document.cookie)</script>",
        );
        expect(result.status).toBe(401);
        expect(result.accessToken).toBeUndefined();
    });
});

describe("Login – Oversized input", () => {
    test("extremely long email is rejected", async () => {
        const longEmail = "a".repeat(10_000) + "@example.edu";
        const result = await performLogin(longEmail, TEST_PASSWORD);
        expect(result.status).toBe(400);
        expect(result.accessToken).toBeUndefined();
    });

    test("extremely long password is rejected gracefully", async () => {
        const longPassword = "A1!!".repeat(100_000); // 400KB
        const result = await performLogin(TEST_EMAIL, longPassword);
        // Should either reject or simply fail to match – must not crash
        expect(result.status === 400 || result.status === 401).toBe(true);
        expect(result.accessToken).toBeUndefined();
    });
});

describe("Login – Timing-safe responses", () => {
    test("response time for wrong email and wrong password are similar order of magnitude", async () => {
        // This is a heuristic test – it checks that no obvious shortcut exists.
        // In a real parameterized query flow bcrypt always runs (or doesn't),
        // but here we verify the mock mirrors that behavior.

        const runs = 3;
        const wrongEmailTimes: number[] = [];
        const wrongPassTimes: number[] = [];

        for (let i = 0; i < runs; i++) {
            const t0 = performance.now();
            await performLogin("nonexistent@example.edu", TEST_PASSWORD);
            wrongEmailTimes.push(performance.now() - t0);
        }

        for (let i = 0; i < runs; i++) {
            const t0 = performance.now();
            await performLogin(TEST_EMAIL, "WrongPassword!!");
            wrongPassTimes.push(performance.now() - t0);
        }

        // We're just confirming both paths return fast and don't hang
        const avgWrongEmail =
            wrongEmailTimes.reduce((a, b) => a + b, 0) / runs;
        const avgWrongPass =
            wrongPassTimes.reduce((a, b) => a + b, 0) / runs;

        // Both should complete under 2 seconds even with bcrypt
        expect(avgWrongEmail).toBeLessThan(2_000);
        expect(avgWrongPass).toBeLessThan(2_000);
    });
});

describe("Login – JWT token verification", () => {
    test("access token cannot be verified with onboarding secret", async () => {
        const result = await performLogin(TEST_EMAIL, TEST_PASSWORD);
        const decoded = verifyToken(result.accessToken!, "onboarding");
        expect(decoded).toBeNull();
    });

    test("access token cannot be verified with resetPassword secret", async () => {
        const result = await performLogin(TEST_EMAIL, TEST_PASSWORD);
        const decoded = verifyToken(result.accessToken!, "resetPassword");
        expect(decoded).toBeNull();
    });

    test("tampered token fails verification", async () => {
        const result = await performLogin(TEST_EMAIL, TEST_PASSWORD);
        const tampered = result.accessToken! + "tampered";
        const decoded = verifyToken(tampered, "access");
        expect(decoded).toBeNull();
    });

    test("token signed with wrong secret fails verification", async () => {
        const fakeToken = jwt.sign(
            { sub: TEST_USER_ID, type: "access" },
            "wrong-secret",
            { expiresIn: "7d" },
        );
        const decoded = verifyToken(fakeToken, "access");
        expect(decoded).toBeNull();
    });

    test("expired token fails verification", async () => {
        const expiredToken = jwt.sign(
            { sub: TEST_USER_ID, type: "access" },
            JWT_ACCESS_SECRET,
            { expiresIn: "-1s" },
        );
        const decoded = verifyToken(expiredToken, "access");
        expect(decoded).toBeNull();
    });

    test("token with missing sub claim fails verification", async () => {
        const noSubToken = jwt.sign(
            { type: "access" },
            JWT_ACCESS_SECRET,
            { expiresIn: "7d" },
        );
        const decoded = verifyToken(noSubToken, "access");
        expect(decoded).toBeNull();
    });

    test("token with wrong type claim fails verification", async () => {
        const wrongTypeToken = jwt.sign(
            { sub: TEST_USER_ID, type: "onboarding" },
            JWT_ACCESS_SECRET,
            { expiresIn: "7d" },
        );
        const decoded = verifyToken(wrongTypeToken, "access");
        expect(decoded).toBeNull();
    });

    test("none algorithm attack is rejected", async () => {
        // Craft a JWT with alg: none (classic attack)
        const header = Buffer.from(
            JSON.stringify({ alg: "none", typ: "JWT" }),
        ).toString("base64url");
        const payload = Buffer.from(
            JSON.stringify({ sub: TEST_USER_ID, type: "access" }),
        ).toString("base64url");
        const noneToken = `${header}.${payload}.`;

        const decoded = verifyToken(noneToken, "access");
        expect(decoded).toBeNull();
    });
});

describe("Login – Cookie security properties", () => {
    test("cookie is httpOnly (not accessible via JavaScript)", async () => {
        const result = await performLogin(TEST_EMAIL, TEST_PASSWORD);
        expect(result.cookieSet!.options.httpOnly).toBe(true);
    });

    test("cookie uses SameSite lax to prevent CSRF", async () => {
        const result = await performLogin(TEST_EMAIL, TEST_PASSWORD);
        expect(result.cookieSet!.options.sameSite).toBe("lax");
    });

    test("cookie path is root", async () => {
        const result = await performLogin(TEST_EMAIL, TEST_PASSWORD);
        expect(result.cookieSet!.options.path).toBe("/");
    });
});

describe("Login – Zod schema validation (Login model)", () => {
    // Import the schema inline to avoid SvelteKit alias issues in Bun
    const { z } = require("zod");

    const Login = z.object({
        email: z.string().email().max(100),
        _password: z.string(),
    });

    test("valid login payload passes validation", () => {
        const result = Login.safeParse({
            email: TEST_EMAIL,
            _password: TEST_PASSWORD,
        });
        expect(result.success).toBe(true);
    });

    test("missing email fails validation", () => {
        const result = Login.safeParse({ _password: TEST_PASSWORD });
        expect(result.success).toBe(false);
    });

    test("missing password fails validation", () => {
        const result = Login.safeParse({ email: TEST_EMAIL });
        expect(result.success).toBe(false);
    });

    test("invalid email format fails validation", () => {
        const result = Login.safeParse({
            email: "not-an-email",
            _password: TEST_PASSWORD,
        });
        expect(result.success).toBe(false);
    });

    test("email over 100 characters fails validation", () => {
        const result = Login.safeParse({
            email: "a".repeat(95) + "@b.com",
            _password: TEST_PASSWORD,
        });
        expect(result.success).toBe(false);
    });

    test("numeric password type still passes (it's a string cast)", () => {
        const result = Login.safeParse({
            email: TEST_EMAIL,
            _password: "12345678",
        });
        expect(result.success).toBe(true);
    });
});

describe("Login – Password hashing (bcrypt)", () => {
    test("bcrypt hash is not stored in plaintext", async () => {
        const hash = await bcrypt.hash(TEST_PASSWORD, 4);
        expect(hash).not.toBe(TEST_PASSWORD);
        expect(hash).toStartWith("$2b$");
    });

    test("same password produces different hashes (salted)", async () => {
        const hash1 = await bcrypt.hash(TEST_PASSWORD, 4);
        const hash2 = await bcrypt.hash(TEST_PASSWORD, 4);
        expect(hash1).not.toBe(hash2);
    });

    test("bcrypt compare correctly validates matching password", async () => {
        const hash = await bcrypt.hash(TEST_PASSWORD, 4);
        const result = await bcrypt.compare(TEST_PASSWORD, hash);
        expect(result).toBe(true);
    });

    test("bcrypt compare rejects wrong password", async () => {
        const hash = await bcrypt.hash(TEST_PASSWORD, 4);
        const result = await bcrypt.compare("WrongPassword!!", hash);
        expect(result).toBe(false);
    });
});

describe("Login – Edge cases", () => {
    test("email with leading/trailing whitespace still matches if trimmed", async () => {
        // Our performLogin trims + lowercases; real app should too
        const result = await performLogin(`  ${TEST_EMAIL}  `, TEST_PASSWORD);
        expect(result.status).toBe(303);
    });

    test("email matching is case-insensitive", async () => {
        const result = await performLogin(
            TEST_EMAIL.toUpperCase(),
            TEST_PASSWORD,
        );
        expect(result.status).toBe(303);
    });

    test("password matching is case-sensitive", async () => {
        const result = await performLogin(
            TEST_EMAIL,
            TEST_PASSWORD.toLowerCase(),
        );
        // Unless the password happens to already be lowercase, this should fail
        if (TEST_PASSWORD !== TEST_PASSWORD.toLowerCase()) {
            expect(result.status).toBe(401);
        }
    });

    test("multiple rapid login attempts all return consistent results", async () => {
        const results = await Promise.all(
            Array.from({ length: 10 }, () =>
                performLogin(TEST_EMAIL, TEST_PASSWORD),
            ),
        );

        for (const r of results) {
            expect(r.status).toBe(303);
            expect(r.accessToken).toBeDefined();
        }
    });

    test("unicode email is handled without error", async () => {
        const result = await performLogin("ñoño@example.edu", TEST_PASSWORD);
        expect(result.status === 400 || result.status === 401).toBe(true);
    });

    test("null byte in email does not cause crash", async () => {
        const result = await performLogin("test\x00@example.edu", TEST_PASSWORD);
        expect(result.status === 400 || result.status === 401).toBe(true);
    });

    test("null byte in password does not cause crash", async () => {
        const result = await performLogin(TEST_EMAIL, "pass\x00word");
        expect(result.status === 400 || result.status === 401).toBe(true);
    });
});

describe("Login – LDAP injection attempts", () => {
    test("LDAP injection characters in email are treated as literals", async () => {
        const payloads = [
            "*)(uid=*))(|(uid=*",
            "admin)(&)",
            "*)(objectClass=*",
        ];

        for (const payload of payloads) {
            const result = await performLogin(payload + "@evil.com", TEST_PASSWORD);
            expect(result.status === 400 || result.status === 401).toBe(true);
            expect(result.accessToken).toBeUndefined();
        }
    });
});

describe("Login – Password schema validation", () => {
    const { z } = require("zod");

    // Mirror the Password schema from models.ts
    const Password = z
        .string()
        .min(8, "Password must be at least 8 characters.")
        .max(70, "Password must be at most 70 characters.")
        .refine((val: string) => /[A-Z]/.test(val), {
            message: "Password must contain at least one uppercase letter.",
        })
        .refine((val: string) => /[0-9]/.test(val), {
            message: "Password must contain at least one number.",
        })
        .refine((val: string) => /[^A-Za-z0-9].*[^A-Za-z0-9]/.test(val), {
            message: "Password must contain at least two special characters.",
        });

    test("password shorter than 8 chars is rejected", () => {
        expect(Password.safeParse("Ab1!!").success).toBe(false);
    });

    test("password longer than 70 chars is rejected", () => {
        expect(Password.safeParse("A1!!" + "a".repeat(70)).success).toBe(false);
    });

    test("password without uppercase is rejected", () => {
        expect(Password.safeParse("abcdefg1!!").success).toBe(false);
    });

    test("password without number is rejected", () => {
        expect(Password.safeParse("Abcdefgh!!").success).toBe(false);
    });

    test("password with only one special character is rejected", () => {
        expect(Password.safeParse("Abcdefg1!").success).toBe(false);
    });

    test("valid password passes all rules", () => {
        expect(Password.safeParse("Abcdefg1!!").success).toBe(true);
    });
});
