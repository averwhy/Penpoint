import { z } from "zod";

export const passwordSchema = z
	.string()
	.min(8, "Password must be at least 8 characters.")
	.max(256, "Password must be at most 256 characters.")
	.refine((val) => /[A-Z]/.test(val), {
		error: "Password must contain at least one uppercase letter.",
	})
	.refine((val) => /[0-9]/.test(val), {
		error: "Password must contain at least one number.",
	})
	.refine((val) => /[^A-Za-z0-9].*[^A-Za-z0-9]/.test(val), {
		error: "Password must contain at least two special characters.",
	});

export const loginSchema = z.object({
	email: z.email(),
	password: passwordSchema,
});

export const registerSchema = z.object({
	name: z.string(),
	email: z.email(),
	password: passwordSchema,
	studentid: z.string(),
	reason: z.string(),
});

// db schemas
export const studentSchema = z.object({
	student_id: z.string().length(7),
	email: z.email(),
	name: z.string(),
	created_at: z.coerce.date(),
	updated_at: z.coerce.date(),
});

export const userSchema = z.object({
	id: z.uuid(),
	student_id: z.string().length(7),
	email: z.email(),
	name: z.string(),
	role: z.enum(["unapproved", "club", "sga", "admin"]),
	request_reason: z.string(),
	last_login: z.coerce.date(),
	created_at: z.coerce.date(),
	updated_at: z.coerce.date(),
});

export const semesterSchema = z.object({
	id: z.uuid(),
	starts: z.coerce.date(),
	ends: z.coerce.date(),
	code: z.string().length(3),
	created_at: z.coerce.date(),
	updated_at: z.coerce.date(),
});

export const clubSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	acronym: z.string(),
	governing_board: z.boolean(),
	created_at: z.coerce.date(),
	updated_at: z.coerce.date(),
});

export const clubUserSchema = z.object({
	id: z.uuid(),
	position: z.string(),
	user_id: z.uuid(),
	club_id: z.uuid(),
	semester_id: z.uuid(),
	created_at: z.coerce.date(),
	updated_at: z.coerce.date(),
});

export const eventSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	location: z.string(),
	point_value: z.int(),
	starts_at: z.coerce.date(),
	ends_at: z.coerce.date(),
	created_at: z.coerce.date(),
	updated_at: z.coerce.date(),
});

export const tapSchema = z.object({
	id: z.uuid(),
	semester_id: z.uuid(),
	student_id: z.string().length(7),
	event_id: z.uuid(),
});

// API Response schemas
export const loginResponseSchema = z.object({
	accessToken: z.string(),
	user: userSchema,
});

// Type exports for use in components
export type Student = z.infer<typeof studentSchema>;
export type User = z.infer<typeof userSchema>;
export type Semester = z.infer<typeof semesterSchema>;
export type Club = z.infer<typeof clubSchema>;
export type ClubUser = z.infer<typeof clubUserSchema>;
export type Event = z.infer<typeof eventSchema>;
export type Tap = z.infer<typeof tapSchema>;

export type Login = z.infer<typeof loginSchema>;
export type Password = z.infer<typeof passwordSchema>;
export type Registration = z.infer<typeof registerSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
