import postgres from "postgres";
import { studentSchema } from "#imports";
import type { Student } from "./schemas";

export function usePostgres() : postgres.Sql {
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
	const result = await sql`
		INSERT INTO users (student_id)
		VALUES (${student_id})
		RETURNING *
	`;

	return studentSchema.parse(result.at(0));
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