import { z } from "zod";

export const loginSchema = z.object({
	email: z.email(),
	password: z.string().min(6),
});

// db schemas
export const userSchema = z.object({
	id: z.uuid(),
	email: z.email(),
	name: z.string(),
	last_login: z.iso.datetime(),
	created_at: z.iso.datetime(),
	updated_at: z.iso.datetime()
});

export const studentSchema = z.object({
	student_id: z.string().length(7),
	email: z.email(),
	name: z.string(),
	created_at: z.iso.datetime(),
	updated_at: z.iso.datetime()
})

// API Response schemas
export const loginResponseSchema = z.object({
	accessToken: z.string(),
	user: userSchema,
});

export const sessionResponseSchema = z.object({
	user: userSchema,
});

// Type exports for use in components
export type User = z.infer<typeof userSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type SessionResponse = z.infer<typeof sessionResponseSchema>;
