import { z } from "zod";

export const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
});

// User schemas
export const userSchema = z.object({
	id: z.string().uuid(),
	email: z.string().email(),
	name: z.string(),
});

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
