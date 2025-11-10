<script lang="ts">
    import { Button } from "$lib/components/ui/button/index";
    import * as Field from "$lib/components/ui/field/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Textarea } from "$lib/components/ui/textarea/index.js";
    import { register } from "$lib/functions/register.remote";
    import { Registration } from "$lib/models";
    import Disc from "@lucide/svelte/icons/disc-3";
    import RegisterIcon from "@lucide/svelte/icons/user-plus";
    import { toast } from "svelte-sonner";

    let pending = false;
</script>

<div class="flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background">
    <div class="grid grid-cols-2 gap-x-5">
        <div class="">
            <h1 class="text-4xl">Register</h1>
            <h3>
                SGA, OSI and Club<br />E-Board member registration only.
            </h3>
        </div>
        <div class="items-center gap-2 flex-1">
            <form
                {...register.preflight(Registration).enhance(async ({ form, data, submit }) => {
                    pending = true;
                    try {
                        await submit();
                        form.reset();

                        toast.success("Account request submitted", {
                            description:
                                "If your request is approved, you'll receive an email from SGA with further instructions to activate your account.",
                        });
                    } catch (error: any) {
                        // ignore redirects
                        if (error?.status >= 300 && error?.status < 400) {
                            throw error;
                        }
                        console.error("register failed", error);
                        toast.error("Register failed", { description: error?.body.message });
                    } finally {
                        pending = false;
                    }
                })}
            >
                <Field.Set class="w-full">
                    <Field.Group>
                        <Field.Field>
                            <Input {...register.fields.student_id.as("text")} class="w-full" placeholder="Student ID" />
                        </Field.Field>
                        <Field.Field>
                            <Input {...register.fields.name.as("text")} class="w-full" placeholder="Full Name" />
                        </Field.Field>
                        <Field.Field>
                            <Input {...register.fields.email.as("email")} class="w-full" placeholder="Email" />
                        </Field.Field>
                        <Field.Field>
                            <Textarea
                                {...register.fields.reason.as("text")}
                                class="w-full"
                                placeholder="Why are you requesting an account?"
                            />
                        </Field.Field>
                    </Field.Group>
                </Field.Set>

                <Button class="mt-3" type="submit" disabled={pending} aria-disabled={pending}>
                    {#if pending}
                        <Disc class="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                        Submitting…
                    {:else}
                        <RegisterIcon class="h-4 w-4 mr-2" />
                        Register
                    {/if}
                </Button>
            </form>
        </div>
    </div>
</div>
