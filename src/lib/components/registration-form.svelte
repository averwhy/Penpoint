<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Checkbox } from "$lib/components/ui/checkbox/index.js";
    import * as Field from "$lib/components/ui/field/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import type { ComponentProps } from "svelte";
    import { toast } from "svelte-sonner";
    import { register } from "$lib/functions/register.remote";
    import { Registration } from "$lib/models";
    import { Textarea } from "$lib/components/ui/textarea/index.js";
    import Disc from "@lucide/svelte/icons/disc-3";
    import RegisterIcon from "@lucide/svelte/icons/user-plus";

    let { ...restProps }: ComponentProps<typeof Card.Root> = $props();
    let pending = $state(false);
    let isCampusLeader = $state(false); // sga, osi or e-board member
</script>

<Card.Root {...restProps}>
    <Card.Header>
        <Card.Title>Request an account</Card.Title>
        <Card.Description>
            Enter your information below to create an account. If you are an SGA, Club E-Board member, or OSI staff,
            create an account here if you haven't already, then please email <a
                href="mailto:StudentGovernmentAssociation@snhu.edu">sga@snhu.edu</a
            > to obtain the correct role for your account.
        </Card.Description>
    </Card.Header>
    <Card.Content>
        <form
            {...register.preflight(Registration).enhance(async form => {
                pending = true;
                try {
                    await form.submit();
                    form.element.reset();

                    // TODO: redirect to login page with a success message
                } catch (error: any) {
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
                <Field.Field>
                    <Field.Label for="password">Password</Field.Label>
                    <Input {...register.fields._password.as("password")} placeholder="Super secure password" required />
                </Field.Field>
                <Field.Field>
                    <Button type="submit" disabled={pending} variant="outline">
                        {#if pending}
                            <Disc class="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                            Submitting…
                        {:else}
                            <RegisterIcon class="mr-2 h-4 w-4" />
                            Register Account
                        {/if}
                    </Button>
                    <Field.Description class="px-6 text-center">
                        Already have an account? <a href="/login">Sign in</a>
                    </Field.Description>
                </Field.Field>
            </Field.Group>
        </form>
    </Card.Content>
</Card.Root>
