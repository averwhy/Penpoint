import postgres from "postgres";
import { studentSchema, userSchema } from "#imports";
import type { Student, User } from "./schemas";

export function usePostgres(): postgres.Sql {
	if (!process.env.POSTGRES_URL) {
		throw createError("Missing `POSTGRES_URL` environment variable");
	}
	const pgconnection = postgres(process.env.POSTGRES_URL as string, {
		//ssl: "require",
		connect_timeout: 60,
	});
	console.info("Connected to Postgres!");
	return pgconnection;
}

export async function createStudent(student_id: number): Promise<Student> {
	const sql = usePostgres();
	// here we only insert the student ID because we don't have the name or email, and the created_at is set to now by default
	const result = await sql`
		INSERT INTO students (student_id)
		VALUES (${student_id})
		RETURNING *
	`;

	return studentSchema.parse(result.at(0));
}

export async function createUser(student_id: number, email: string, name: string, request_reason: string, password_hash: string, role = "unapproved"): Promise<User> {
	const sql = usePostgres();

	const result = await sql`
		INSERT INTO users (student_id, email, name, role, request_reason, password_hash)
		VALUES (${student_id}, ${email}, ${name}, ${role}, ${request_reason}, ${password_hash})
		RETURNING *
	`;

	return userSchema.parse(result.at(0));
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