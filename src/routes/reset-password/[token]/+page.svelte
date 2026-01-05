<script lang="ts">
    import { Button } from "$lib/components/ui/button/index";
    import * as Field from "$lib/components/ui/field/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { resetPassword } from "$lib/functions/reset-password.remote.js";
    import { SetPassword } from "$lib/models";
    import Disc from "@lucide/svelte/icons/disc-3";
    import LoginIcon from "@lucide/svelte/icons/log-in";
    import { toast } from "svelte-sonner";

    const { data } = $props();
    const { token } = data;

    let pending = $state(false);
</script>

<div class="flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background">
    <div class="grid grid-cols-2 gap-x-5">
        <div class="">
            <h1 class="text-4xl">Reset your Penpoint password</h1>
            <h3>
                Forgot your password? No worries!
                <br />
                Please set your new account password.
            </h3>
        </div>
        <div class="items-center gap-2 flex-1">
            <form
                {...resetPassword.preflight(SetPassword).enhance(async ({ form, data, submit }) => {
                    pending = true;
                    try {
                        await submit();
                        form.reset();
                    } catch (error: any) {
                        // ignore redirects
                        if (error?.status >= 300 && error?.status < 400) {
                            throw error;
                        }
                        console.error("reset failed", error);
                        toast.error("Password reset failed", { description: error?.body.message });
                    } finally {
                        pending = false;
                    }
                })}
            >
                <input {...resetPassword.fields.token.as("text")} value={token} hidden />

                <Field.Set class="w-full">
                    <Field.Group>
                        <Field.Field>
                            {#each resetPassword.fields._password.issues() ?? [] as issue}
                                <p class="text-red-500">{issue.message}</p>
                            {/each}
                            <Input
                                {...resetPassword.fields._password.as("password")}
                                class="w-full"
                                placeholder="Password"
                            />
                        </Field.Field>
                    </Field.Group>
                </Field.Set>

                <Button class="mt-3" type="submit" disabled={pending} aria-disabled={pending}>
                    {#if pending}
                        <Disc class="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                        Saving…
                    {:else}
                        <LoginIcon class="h-4 w-4 mr-2" />
                        Save Password
                    {/if}
                </Button>
            </form>
        </div>
    </div>
</div>
