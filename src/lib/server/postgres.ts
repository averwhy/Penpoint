import { privateEnv } from "$lib/env/private";
import { Student, User } from "$lib/models";
import postgres from "postgres";

export const sql = postgres(privateEnv.DATABASE_URL, {
    //ssl: "require",
    connect_timeout: 60,
});

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
    password_hash: string,
    role = "unapproved",
): Promise<User> {
    const result = await sql`
		INSERT INTO users (student_id, email, name, role, request_reason, password_hash)
		VALUES (${student_id}, ${email}, ${name}, ${role}, ${request_reason}, ${password_hash})
		RETURNING *
	`;

    return User.parse(result[0]);
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
