import { form } from "$app/server";
import { Registration } from "$lib/models";
import { createUser, userExists } from "$lib/server/postgres";
import { error } from "@sveltejs/kit";

export const register = form(Registration, async register => {
    const [foundUser] = await Promise.all([
        userExists(register.email),
    ]);

    if (foundUser) error(409, { message: "A user with that email already exists." });

    await createUser(register.email, register.name);

    return { success: true };
});
