<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import * as Field from "$lib/components/ui/field/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import type { ComponentProps } from "svelte";
    import { toast } from "svelte-sonner";
    import { register } from "$lib/functions/register.remote";
    import { Registration } from "$lib/models";
    import Disc from "@lucide/svelte/icons/disc-3";
    import RegisterIcon from "@lucide/svelte/icons/user-plus";

    let { ...restProps }: ComponentProps<typeof Card.Root> = $props();
    let pending = $state(false);
</script>

<Card.Root {...restProps}>
    <Card.Header>
        <Card.Title>Create an account</Card.Title>
        <Card.Description>Enter your information below to create an account.</Card.Description>
    </Card.Header>
    <Card.Content>
        <form
            {...register.preflight(Registration).enhance(async form => {
                pending = true;
                try {
                    await form.submit();
                    form.element.reset();

                    // TODO: Redirect to profile overview
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
            <Field.Group>
                <Field.Field>
                    <Field.Label for="name">Full Name</Field.Label>
                    <Input {...register.fields.name.as("text")} placeholder="Petey Penmen" required />
                </Field.Field>
                <Field.Field>
                    <Field.Label for="email">Email</Field.Label>
                    <Input {...register.fields.email.as("email")} placeholder="sga@snhu.edu" required />
                </Field.Field>
                <Field.Group>
                    <Field.Field>
                        <Button type="submit" disabled={pending} variant="outline"
                            >{#if pending}
                                <Disc class="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                                Submitting…
                            {:else}
                                <RegisterIcon class="h-4 w-4 mr-2" />
                                Register Account
                            {/if}</Button
                        >
                        <Field.Description class="px-6 text-center">
                            Already have an account? <a href="/login">Sign in</a>
                        </Field.Description>
                    </Field.Field>
                </Field.Group>
            </Field.Group>
        </form>
    </Card.Content>
</Card.Root>
