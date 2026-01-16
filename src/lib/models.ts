import { z } from "zod";

export const Password = z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(70, "Password must be at most 70 characters.")
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

export const StudentId = z.string().regex(/^\d{7}$/);
export type StudentId = z.infer<typeof StudentId>;

export const Login = z.object({
    email: z.email().max(100),
    _password: z.string(), // don't use password schema for logging in, it's used on registration
});
export type Login = z.infer<typeof Login>;

export const Registration = z.object({
    name: z.string().min(1).max(100),
    email: z.email().max(100),
    // password: Password, // password schema should only be used here
    student_id: StudentId,
    reason: z.string().min(1).max(10000),
});
export type Registration = z.infer<typeof Registration>;

// db schemas

export const Student = z.object({
    student_id: StudentId,
    email: z.email().max(100).nullable(),
    name: z.string().max(100).nullable(),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date(),
});
export type Student = z.infer<typeof Student>;

export const User = z.object({
    id: z.uuid(),
    student_id: StudentId,
    email: z.email().max(64),
    name: z.string().max(64),
    role: z.enum(["inactive", "unapproved", "blocked", "club", "sga", "admin"]),
    pending: z.boolean().default(false),
    request_reason: z.string().max(10000),
    requested_at: z.coerce.date(),
    last_login: z.coerce.date(),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date(),
    password_reset_last_requested_at: z.coerce.date().nullable(),
});
export type User = z.infer<typeof User>;

export const NewUser = User.pick({
    id: true,
    student_id: true,
    email: true,
    name: true,
    request_reason: true,
    created_at: true,
    updated_at: true,
});
export type NewUser = z.infer<typeof NewUser>;

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
    name: z.string().max(100),
    acronym: z.string().max(100),
    bio: z.string().max(300).nullable(),
    governing_board: z.boolean(),
    university_office: z.boolean(),
    image_filename: z.string().max(64).nullable(),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date(),
});
export type Club = z.infer<typeof Club>;

export const ClubUser = z.object({
    id: z.uuid(),
    position: z.string().max(100),
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
    name: z.string().max(64),
    location: z.string(),
    point_value: z.int(),
    image_filename: z.string().max(64).nullable(),
    permalink: z.string().max(64).nullable(),
    approval_status: z.enum(["unapproved", "accepted", "denied"]),
    special_requests: z.string().max(1024).nullable(),
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

export const Location = z.object({
    id: z.uuid(),
    location: z.string().max(64),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date(),
});
export type Location = z.infer<typeof Location>;

// API Request schemas

export const PointCheck = z.object({
    student_id: StudentId,
});
export type PointCheck = z.infer<typeof PointCheck>;

export const EventStatusUpdate = z.object({
    event_id: z.uuid(),
    approval_status: z.enum(["accepted", "denied"]),
});
export type EventStatusUpdate = z.infer<typeof EventStatusUpdate>;

export const EventEdit = z.object({
    event_id: z.uuid(),
    name: z.string().max(64).optional(),
    location: z.string().optional(),
    starts_at: z.coerce.date().optional(),
    ends_at: z.coerce.date().optional(),
});
export type EventEdit = z.infer<typeof EventEdit>;

// API Response schemas

export const LoginResponse = z.object({
    accessToken: z.string(),
    user: User,
});
export type LoginResponse = z.infer<typeof LoginResponse>;

// Other requests
export const SetPassword = z.object({ _password: Password, token: z.string() });
export type SetPassword = z.infer<typeof SetPassword>;