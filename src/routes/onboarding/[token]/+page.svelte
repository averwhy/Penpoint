<script lang="ts">
    import { Button } from "$lib/components/ui/button/index";
    import * as Field from "$lib/components/ui/field/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { setPassword } from "$lib/functions/onboarding.remote.js";
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
            <h1 class="text-4xl">Welcome to Penpoint!</h1>
            <h3>
                Your account request has been approved!
                <br />
                Please set your account password to get started.
            </h3>
        </div>
        <div class="items-center gap-2 flex-1">
            <form
                {...setPassword.preflight(SetPassword).enhance(async ({ form, data, submit }) => {
                    pending = true;
                    try {
                        await submit();
                        form.reset();
                    } catch (error: any) {
                        // ignore redirects
                        if (error?.status >= 300 && error?.status < 400) {
                            throw error;
                        }
                        console.error("onboarding failed", error);
                        toast.error("Onboarding failed", { description: error?.body.message });
                    } finally {
                        pending = false;
                    }
                })}
            >
                <input {...setPassword.fields.token.as("text")} value={token} hidden />

                <Field.Set class="w-full">
                    <Field.Group>
                        <Field.Field>
                            {#each setPassword.fields._password.issues() as issue}
                                <p class="text-red-500">{issue.message}</p>
                            {/each}
                            <Input
                                {...setPassword.fields._password.as("password")}
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
