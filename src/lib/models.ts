import { z } from "zod";

export const Password = z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(256, "Password must be at most 256 characters.")
    .refine(val => /[A-Z]/.test(val), {
        error: "Password must contain at least one uppercase letter.",
    })
    .refine(val => /[0-9]/.test(val), {
        error: "Password must contain at least one number.",
    })
    .refine(val => /[^A-Za-z0-9].*[^A-Za-z0-9]/.test(val), {
        error: "Password must contain at least two special characters.",
    });
export type Password = z.infer<typeof Password>;

export const Login = z.object({
    email: z.email(),
    _password: z.string(), // don't use password schema for logging in, it's used on registration
});
export type Login = z.infer<typeof Login>;

export const Registration = z.object({
    name: z.string(),
    email: z.email(),
    password: Password, // password schema should only be used here
    studentid: z.string(),
    reason: z.string(),
});
export type Registration = z.infer<typeof Registration>;

// db schemas

export const StudentId = z.string().regex(/^\d{7}$/);
export type StudentId = z.infer<typeof StudentId>;

export const Student = z.object({
    student_id: StudentId,
    email: z.email(),
    name: z.string(),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date(),
});
export type Student = z.infer<typeof Student>;

export const User = z.object({
    id: z.uuid(),
    student_id: StudentId,
    email: z.email(),
    name: z.string(),
    role: z.enum(["inactive", "unapproved", "club", "sga", "admin"]),
    request_reason: z.string(),
    last_login: z.coerce.date(),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date(),
});
export type User = z.infer<typeof User>;

export const Semester = z.object({
    id: z.uuid(),
    starts: z.coerce.date(),
    ends: z.coerce.date(),
    code: z.string().max(3),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date(),
});
export type Semester = z.infer<typeof Semester>;

export const Club = z.object({
    id: z.uuid(),
    name: z.string(),
    acronym: z.string(),
    governing_board: z.boolean(),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date(),
});
export type Club = z.infer<typeof Club>;

export const ClubUser = z.object({
    id: z.uuid(),
    position: z.string(),
    user_id: z.uuid(),
    club_id: z.uuid(),
    for_semester: z.uuid(),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date(),
});
export type ClubUser = z.infer<typeof ClubUser>;

export const Event = z.object({
    id: z.uuid(),
    club_id: z.uuid(),
    semester_id: z.uuid(),
    name: z.string(),
    location: z.string(),
    point_value: z.int(),
    starts_at: z.coerce.date(),
    ends_at: z.coerce.date(),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date(),
});
export type Event = z.infer<typeof Event>;

export const Tap = z.object({
    id: z.uuid(),
    student_id: StudentId,
    event_id: z.uuid(),
});
export type Tap = z.infer<typeof Tap>;

export const PointCheck = z.object({
    student_id: StudentId
})
export type PointCheck = z.infer<typeof PointCheck>;

// API Response schemas

export const LoginResponse = z.object({
    accessToken: z.string(),
    user: User,
});
export type LoginResponse = z.infer<typeof LoginResponse>;

export const EventPageResponse = z.object({
    event: Event,
    club_name: z.string()
})
export type EventPageResponse = z.infer<typeof EventPageResponse>;