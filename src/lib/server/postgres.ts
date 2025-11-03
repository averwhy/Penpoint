import { privateEnv } from "$lib/env/private";
import { Semester, Student, User } from "$lib/models";
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

export async function getMostRecentSemesterIncludingActive(): Promise<Semester> {
    const result = await sql`
        SELECT *
        FROM semesters
        WHERE NOW() BETWEEN starts AND ends
        ORDER BY starts DESC
        LIMIT 1
    `;

    if (result.count === 0) {
        // No active semester, get the most recently ended one
        const fallback = await sql`
            SELECT *
            FROM semesters
            WHERE ends < NOW()
            ORDER BY ends DESC
            LIMIT 1
        `;
        return Semester.parse(fallback[0]);
    }

    return Semester.parse(result[0]);
}

export async function createStudent(student_id: number): Promise<Student> {
    // here we only insert the student ID because we don't have the name or email, and the created_at is set to now by default
    const result = await sql`
		INSERT INTO students (student_id)
		VALUES (${student_id})
		RETURNING *
	`;

    return Student.parse(result[0]);
}

export async function createUser(
    student_id: number,
    email: string,
    name: string,
    request_reason: string,
    role = "unapproved",
    password_hash?: string,
): Promise<User> {
    const result = await sql`
		INSERT INTO users (student_id, email, name, role, request_reason, password_hash)
		VALUES (${student_id}, ${email}, ${name}, ${role}, ${request_reason}, ${password_hash ?? null})
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

export async function studentExists(student_id: number): Promise<boolean> {
    const result = await sql`
		SELECT student_id
		FROM students
		WHERE student_id = ${student_id}
	`;

    return result.count === 1;
}

export async function userExists(student_id = 0, email = ""): Promise<boolean> {
    const result = await sql`
		SELECT student_id
		FROM users
		WHERE student_id = ${student_id}
		OR email = ${email}
	`;

    return result.count === 1;
}
