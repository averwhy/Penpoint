import { form } from "$app/server";
import { Registration } from "$lib/models";
import { createStudent, createUser, studentExists, userExists } from "$lib/server/postgres";
import { error } from "@sveltejs/kit";

export const register = form(Registration, async register => {
    const [foundStudent, foundUser] = await Promise.all([
        studentExists(register.student_id, register.email),
        userExists(register.student_id, register.email),
    ]);

    if (foundUser || foundStudent) error(409, { message: "A user with that email or student ID already exists." });

    await Promise.all([
        createStudent(register),
        createUser(register.student_id, register.email, register.name, register.reason, "unapproved"),
    ]);

    return { success: true };
});
