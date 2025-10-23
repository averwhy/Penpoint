import { error } from "@sveltejs/kit";
import postgres from "postgres";
import { Semester, Student, User } from "./models";

export function usePostgres(): postgres.Sql {
    if (!process.env.DATABASE_URL) {
        error(500, "Missing `DATABASE_URL` environment variable");
    }
    try {
        const pgconnection = postgres(process.env.DATABASE_URL as string, {
            //ssl: "require",
            connect_timeout: 60,
        });
        console.info("Connected to Postgres!");
        return pgconnection;
    } catch (err) {
        error(500, `Unexpected error when connecting to PostgreSQL: ${err}`);
    }
}

export async function getMostRecentSemesterIncludingActive(): Promise<Semester> {
    const sql = usePostgres();

    const result = await sql`
        SELECT *
        FROM semesters
        ORDER BY starts DESC
        LIMIT 1
    `

    return Semester.parse(result.at(0));
}

export async function createStudent(student_id: number): Promise<Student> {
    const sql = usePostgres();
    // here we only insert the student ID because we don't have the name or email, and the created_at is set to now by default
    const result = await sql`
		INSERT INTO students (student_id)
		VALUES (${student_id})
		RETURNING *
	`;

    return Student.parse(result.at(0));
}

export async function createUser(
    student_id: number,
    email: string,
    name: string,
    request_reason: string,
    role = "unapproved",
    password_hash?: string,
): Promise<User> {
    const sql = usePostgres();

    const result = await sql`
		INSERT INTO users (student_id, email, name, role, request_reason, password_hash)
		VALUES (${student_id}, ${email}, ${name}, ${role}, ${request_reason}, ${password_hash ?? null})
		RETURNING *
	`;

    return User.parse(result.at(0));
}

export async function updateUserPassword(
    email: string,
    password_hash: string
) {
    const sql = usePostgres();

    await sql`
        UPDATE users 
        SET password_hash = ${password_hash}
        WHERE email = ${email}
    `;
}

export async function studentExists(student_id: number): Promise<boolean> {
    const sql = usePostgres();
    const result = await sql`
		SELECT student_id
		FROM students
		WHERE student_id = ${student_id}
	`;

    return result.count === 1;
}

export async function userExists(student_id = 0, email = ""): Promise<boolean> {
    const sql = usePostgres();
    const result = await sql`
		SELECT student_id
		FROM users
		WHERE student_id = ${student_id}
		OR email = ${email}
	`;

    return result.count === 1;
}
