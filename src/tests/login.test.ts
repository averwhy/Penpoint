import { describe, test, expect, vi, beforeEach, beforeAll } from "vitest";
import jwt, { type JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";

// Hoisted mocks (available in vi.mock factories) 
const { sqlMock, mockCookiesSet } = vi.hoisted(() => ({
    sqlMock: vi.fn(),
    mockCookiesSet: vi.fn(),
}));

// Module mocks 
vi.mock("$lib/env/private", () => ({
    privateEnv: {
        jwtSecrets: {
            access: "test-access-secret",
            onboarding: "test-onboarding-secret",
            resetPassword: "test-reset-password-secret",
        },
        NODE_ENV: "test",
    },
}));

vi.mock("$lib/server/postgres", () => ({
    sql: sqlMock,
    db: vi.fn(),
}));

vi.mock("$app/server", () => ({
    form: (_schema: unknown, handler: Function) => handler,
    getRequestEvent: () => ({
        cookies: {
            set: mockCookiesSet,
            get: vi.fn(),
            delete: vi.fn(),
        },
    }),
}));

// Real imports (these use the mocked modules above) 
import {
    hashPassword,
    verifyPassword,
    generateAccessToken,
    verifyToken,
} from "$lib/server/auth";
// Our mock makes form() return the raw handler, so login is callable at runtime
// but typed as RemoteForm. Cast to the actual handler signature.
import { login as _login } from "$lib/functions/login.remote";
const login = _login as unknown as (data: { email: string; _password: string }) => Promise<never>;
import { Login, Password } from "$lib/models";

// Constants 
const JWT_ACCESS_SECRET = "test-access-secret";
const JWT_ONBOARDING_SECRET = "test-onboarding-secret";
const JWT_RESET_PASSWORD_SECRET = "test-reset-password-secret";

const TEST_EMAIL = "testuser@example.edu";
const TEST_PASSWORD = "Str0ng!!Pass";
const TEST_USER_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const TEST_STUDENT_ID = "1234567";

let TEST_PASSWORD_HASH: string;

// Helpers 
function mockUserRow(overrides: Record<string, unknown> = {}) {
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

/** Queue SQL results for a successful login (SELECT returns user, UPDATE succeeds) */
function setupSuccessfulLogin(rowOverrides: Record<string, unknown> = {}) {
    sqlMock.mockResolvedValueOnce([mockUserRow(rowOverrides)]); // SELECT
    sqlMock.mockResolvedValueOnce([]); // UPDATE last_login
}

/** Queue SQL result for a user-not-found scenario */
function setupNoUserFound() {
    sqlMock.mockResolvedValueOnce([]); // SELECT returns empty
}

/**
 * Calls the REAL login handler and captures the thrown error/redirect.
 * SvelteKit's error() and redirect() both throw
 */
async function attemptLogin(email: string, password: string): Promise<any> {
    try {
        await login({ email, _password: password });
        throw new Error("Expected login to throw (redirect or error)");
    } catch (e) {
        return e;
    }
}

// Setup 
beforeAll(async () => {
    TEST_PASSWORD_HASH = await bcrypt.hash(TEST_PASSWORD, 4); // low rounds for speed
});

beforeEach(() => {
    sqlMock.mockReset();
    mockCookiesSet.mockReset();
});

// AUTH HELPERS (real $lib/server/auth functions)
describe("Auth - Password hashing", () => {
    test("hashPassword produces a valid bcrypt hash", async () => {
        const hash = await hashPassword(TEST_PASSWORD);
        expect(hash).not.toBe(TEST_PASSWORD);
        expect(hash).toMatch(/^\$2[aby]\$/);
    });

    test("verifyPassword returns true for correct password", async () => {
        expect(await verifyPassword(TEST_PASSWORD, TEST_PASSWORD_HASH)).toBe(true);
    });

    test("verifyPassword returns false for wrong password", async () => {
        expect(await verifyPassword("WrongPassword!!", TEST_PASSWORD_HASH)).toBe(false);
    });

    test("same password produces different hashes (salted)", async () => {
        const hash1 = await bcrypt.hash(TEST_PASSWORD, 4);
        const hash2 = await bcrypt.hash(TEST_PASSWORD, 4);
        expect(hash1).not.toBe(hash2);
    });
});

describe("Auth - Token generation", () => {
    test("generateAccessToken produces JWT with correct sub and type claims", () => {
        const token = generateAccessToken(TEST_USER_ID);
        const decoded = jwt.decode(token) as JwtPayload;

        expect(decoded.sub).toBe(TEST_USER_ID);
        expect(decoded.type).toBe("access");
    });

    test("generateAccessToken JWT expires in 7 days", () => {
        const token = generateAccessToken(TEST_USER_ID);
        const decoded = jwt.decode(token) as JwtPayload;

        expect(decoded.exp! - decoded.iat!).toBe(7 * 24 * 60 * 60);
    });
});

describe("Auth - Token verification", () => {
    test("verifyToken validates a correct access token", () => {
        const token = generateAccessToken(TEST_USER_ID);
        const decoded = verifyToken(token, "access");

        expect(decoded).not.toBeNull();
        expect(decoded!.sub).toBe(TEST_USER_ID);
        expect(decoded!.type).toBe("access");
    });

    test("access token cannot be verified as onboarding token", () => {
        const token = generateAccessToken(TEST_USER_ID);
        expect(verifyToken(token, "onboarding")).toBeNull();
    });

    test("access token cannot be verified as resetPassword token", () => {
        const token = generateAccessToken(TEST_USER_ID);
        expect(verifyToken(token, "resetPassword")).toBeNull();
    });

    test("token signed with wrong secret is rejected", () => {
        const fakeToken = jwt.sign({ sub: TEST_USER_ID, type: "access" }, "wrong-secret", {
            expiresIn: "7d",
        });
        expect(verifyToken(fakeToken, "access")).toBeNull();
    });

    test("expired token is rejected", () => {
        const expiredToken = jwt.sign({ sub: TEST_USER_ID, type: "access" }, JWT_ACCESS_SECRET, {
            expiresIn: "-1s",
        });
        expect(verifyToken(expiredToken, "access")).toBeNull();
    });

    test("token with missing sub claim is rejected", () => {
        const noSubToken = jwt.sign({ type: "access" }, JWT_ACCESS_SECRET, { expiresIn: "7d" });
        expect(verifyToken(noSubToken, "access")).toBeNull();
    });

    test("token with wrong type claim is rejected", () => {
        const wrongTypeToken = jwt.sign(
            { sub: TEST_USER_ID, type: "onboarding" },
            JWT_ACCESS_SECRET,
            { expiresIn: "7d" },
        );
        expect(verifyToken(wrongTypeToken, "access")).toBeNull();
    });

    test("alg:none JWT attack is rejected", () => {
        const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString(
            "base64url",
        );
        const payload = Buffer.from(
            JSON.stringify({ sub: TEST_USER_ID, type: "access" }),
        ).toString("base64url");
        const noneToken = `${header}.${payload}.`;

        expect(verifyToken(noneToken, "access")).toBeNull();
    });

    test("tampered token is rejected", () => {
        const token = generateAccessToken(TEST_USER_ID);
        expect(verifyToken(token + "tampered", "access")).toBeNull();
    });

    test("verifyToken calls deleteCookie on invalid token", () => {
        const deleteCookie = vi.fn();
        verifyToken("invalid.token.here", "access", deleteCookie);
        expect(deleteCookie).toHaveBeenCalledOnce();
    });

    test("verifyToken calls deleteCookie when sub is missing", () => {
        const deleteCookie = vi.fn();
        const noSub = jwt.sign({ type: "access" }, JWT_ACCESS_SECRET, { expiresIn: "7d" });
        verifyToken(noSub, "access", deleteCookie);
        expect(deleteCookie).toHaveBeenCalledOnce();
    });

    test("verifyToken calls deleteCookie when type mismatches", () => {
        const deleteCookie = vi.fn();
        const wrongType = jwt.sign(
            { sub: TEST_USER_ID, type: "onboarding" },
            JWT_ACCESS_SECRET,
            { expiresIn: "7d" },
        );
        verifyToken(wrongType, "access", deleteCookie);
        expect(deleteCookie).toHaveBeenCalledOnce();
    });
});

// LOGIN HANDLER (real $lib/functions/login.remote, mocked DB + SvelteKit)
describe("Login - Happy path", () => {
    test("successful login redirects to /app", async () => {
        setupSuccessfulLogin();
        const thrown = await attemptLogin(TEST_EMAIL, TEST_PASSWORD);

        expect(thrown.status).toBe(303);
        expect(thrown.location).toBe("/app");
    });

    test("successful login sets httpOnly cookie with Bearer token", async () => {
        setupSuccessfulLogin();
        await attemptLogin(TEST_EMAIL, TEST_PASSWORD);

        expect(mockCookiesSet).toHaveBeenCalledOnce();
        const [name, value, options] = mockCookiesSet.mock.calls[0];

        expect(name).toBe("authorization");
        expect(value).toMatch(/^Bearer /);
        expect(options.httpOnly).toBe(true);
    });

    test("cookie has correct security options", async () => {
        setupSuccessfulLogin();
        await attemptLogin(TEST_EMAIL, TEST_PASSWORD);

        const options = mockCookiesSet.mock.calls[0][2];
        expect(options.path).toBe("/");
        expect(options.sameSite).toBe("lax");
        expect(options.maxAge).toBe(7 * 24 * 60 * 60);
    });

    test("cookie secure flag is false in test env, true in production", async () => {
        setupSuccessfulLogin();
        await attemptLogin(TEST_EMAIL, TEST_PASSWORD);

        const options = mockCookiesSet.mock.calls[0][2];
        // NODE_ENV is 'test' in our mock, so secure should be false
        expect(options.secure).toBe(false);
    });

    test("JWT in cookie contains correct user ID", async () => {
        setupSuccessfulLogin();
        await attemptLogin(TEST_EMAIL, TEST_PASSWORD);

        const bearerValue = mockCookiesSet.mock.calls[0][1] as string;
        const token = bearerValue.replace("Bearer ", "");
        const decoded = verifyToken(token, "access");

        expect(decoded).not.toBeNull();
        expect(decoded!.sub).toBe(TEST_USER_ID);
    });

    test("successful login calls SQL UPDATE for last_login", async () => {
        setupSuccessfulLogin();
        await attemptLogin(TEST_EMAIL, TEST_PASSWORD);

        // sql was called twice: SELECT then UPDATE
        expect(sqlMock).toHaveBeenCalledTimes(2);
    });
});

describe("Login - Invalid credentials", () => {
    test("non-existent email returns 401", async () => {
        setupNoUserFound();
        const thrown = await attemptLogin("nobody@example.edu", TEST_PASSWORD);

        expect(thrown.status).toBe(401);
        expect(thrown.body.message).toBe("Invalid credentials");
    });

    test("wrong password returns 401", async () => {
        sqlMock.mockResolvedValueOnce([mockUserRow()]);
        const thrown = await attemptLogin(TEST_EMAIL, "WrongPassword!!");

        expect(thrown.status).toBe(401);
        expect(thrown.body.message).toBe("Invalid credentials");
    });

    test("same error for wrong email and wrong password (no user enumeration)", async () => {
        setupNoUserFound();
        const wrongEmail = await attemptLogin("nobody@example.edu", TEST_PASSWORD);

        sqlMock.mockResolvedValueOnce([mockUserRow()]);
        const wrongPass = await attemptLogin(TEST_EMAIL, "WrongPassword!!");

        expect(wrongEmail.status).toBe(wrongPass.status);
        expect(wrongEmail.body.message).toBe(wrongPass.body.message);
    });

    test("user with null password_hash returns 401", async () => {
        sqlMock.mockResolvedValueOnce([mockUserRow({ password_hash: null })]);
        const thrown = await attemptLogin(TEST_EMAIL, TEST_PASSWORD);

        expect(thrown.status).toBe(401);
        expect(thrown.body.message).toBe("Invalid credentials");
    });

    test("no cookie is set on failed login", async () => {
        setupNoUserFound();
        await attemptLogin(TEST_EMAIL, TEST_PASSWORD);
        expect(mockCookiesSet).not.toHaveBeenCalled();
    });

    test("no UPDATE query runs on failed login", async () => {
        setupNoUserFound();
        await attemptLogin(TEST_EMAIL, TEST_PASSWORD);

        // Only the SELECT was called, not the UPDATE
        expect(sqlMock).toHaveBeenCalledTimes(1);
    });
});

describe("Login - Role-based access", () => {
    test("unapproved user gets 403 with approval message", async () => {
        sqlMock.mockResolvedValueOnce([mockUserRow({ role: "unapproved" })]);
        const thrown = await attemptLogin(TEST_EMAIL, TEST_PASSWORD);

        expect(thrown.status).toBe(403);
        expect(thrown.body.message).toContain("approval");
    });

    test("inactive user gets 401 with inactive message", async () => {
        sqlMock.mockResolvedValueOnce([mockUserRow({ role: "inactive" })]);
        const thrown = await attemptLogin(TEST_EMAIL, TEST_PASSWORD);

        expect(thrown.status).toBe(401);
        expect(thrown.body.message).toContain("inactive");
    });

    test("club role user can log in", async () => {
        setupSuccessfulLogin({ role: "club" });
        const thrown = await attemptLogin(TEST_EMAIL, TEST_PASSWORD);
        expect(thrown.status).toBe(303);
    });

    test("sga role user can log in", async () => {
        setupSuccessfulLogin({ role: "sga" });
        const thrown = await attemptLogin(TEST_EMAIL, TEST_PASSWORD);
        expect(thrown.status).toBe(303);
    });

    test("admin role user can log in", async () => {
        setupSuccessfulLogin({ role: "admin" });
        const thrown = await attemptLogin(TEST_EMAIL, TEST_PASSWORD);
        expect(thrown.status).toBe(303);
    });

    test("no cookie or token is set for rejected roles", async () => {
        sqlMock.mockResolvedValueOnce([mockUserRow({ role: "unapproved" })]);
        await attemptLogin(TEST_EMAIL, TEST_PASSWORD);
        expect(mockCookiesSet).not.toHaveBeenCalled();
    });
});

describe("Login - SQL injection", () => {
    test("SQL injection payload is passed as a parameter, not interpolated", async () => {
        const sqliPayload = "' OR '1'='1' --";
        setupNoUserFound();

        await attemptLogin(sqliPayload, TEST_PASSWORD);

        // sqlMock is called with tagged template args: (strings, ...values)
        // The email should be an interpolated value, NOT part of the SQL string
        const callArgs = sqlMock.mock.calls[0];
        const strings = callArgs[0];
        const values = callArgs.slice(1);

        // The SQL template strings should not contain the payload
        const fullSqlTemplate = Array.isArray(strings) ? strings.join("?") : String(strings);
        expect(fullSqlTemplate).not.toContain(sqliPayload);

        // The payload should be in the parameterized values
        expect(values).toContain(sqliPayload);
    });

    test("SQL injection in password cannot bypass bcrypt", async () => {
        sqlMock.mockResolvedValueOnce([mockUserRow()]);
        const thrown = await attemptLogin(TEST_EMAIL, "' OR '1'='1");

        expect(thrown.status).toBe(401);
    });

    test("UNION SELECT in email fails as literal mismatch", async () => {
        setupNoUserFound();
        const thrown = await attemptLogin("' UNION SELECT * FROM users --", TEST_PASSWORD);

        expect(thrown.status).toBe(401);
        expect(thrown.body.message).toBe("Invalid credentials");
    });
});

// ZOD SCHEMAS (real $lib/models imports)
describe("Login - Zod Login schema", () => {
    test("valid login payload passes", () => {
        expect(Login.safeParse({ email: TEST_EMAIL, _password: TEST_PASSWORD }).success).toBe(
            true,
        );
    });

    test("missing email fails", () => {
        expect(Login.safeParse({ _password: TEST_PASSWORD }).success).toBe(false);
    });

    test("missing password fails", () => {
        expect(Login.safeParse({ email: TEST_EMAIL }).success).toBe(false);
    });

    test("invalid email format fails", () => {
        expect(
            Login.safeParse({ email: "not-an-email", _password: TEST_PASSWORD }).success,
        ).toBe(false);
    });

    test("email over 100 characters fails", () => {
        expect(
            Login.safeParse({ email: "a".repeat(95) + "@b.com", _password: TEST_PASSWORD })
                .success,
        ).toBe(false);
    });
});

describe("Login - Zod Password schema", () => {
    test("valid password passes all rules", () => {
        expect(Password.safeParse("Abcdefg1!!").success).toBe(true);
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
});