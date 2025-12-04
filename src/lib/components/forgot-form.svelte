<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "$lib/components/ui/field/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { cn, type WithElementRef } from "$lib/utils.js";
    import type { HTMLFormAttributes } from "svelte/elements";

    let {
        ref = $bindable(null),
        pending = $bindable(false),
        class: className,
        ...restProps
    }: WithElementRef<HTMLFormAttributes> & { pending?: boolean } = $props();

    const id = $props.id();
    let showPassword = $state(false);
</script>

<form class={cn("flex flex-col gap-6", className)} bind:this={ref} {...restProps}>
    <FieldGroup>
        <div class="flex flex-col items-center gap-1 text-center">
            <h1 class="text-2xl font-bold">Forgot your password?</h1>
            <p class="text-muted-foreground text-balance text-sm">
                Enter your email below to request a password reset email.
            </p>
        </div>
        <Field>
            <FieldLabel>Email</FieldLabel>
            <Input name="email" type="email" class="bg-primary" placeholder="example@snhu.edu" required />
        </Field>
        <Field>
            <Button type="submit" disabled={pending}>{pending ? "Loading…" : "Reset Password"}</Button>
        </Field>
        <FieldSeparator class="[&>div]:bg-primary h-2" />
        <Field>
            <FieldDescription class="text-center">
                Don't have an account?
                <a href="/register" class="underline underline-offset-4">Sign up</a>
            </FieldDescription>
            <FieldDescription class="text-center">
                Remember your password?
                <a href="/login" class="underline underline-offset-4">Log in</a>
            </FieldDescription>
        </Field>
    </FieldGroup>
</form>
