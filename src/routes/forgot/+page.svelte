<script lang="ts">
    import CampSNHU from "$lib/assets/CampSNHU.jpg";
    import SGA from "$lib/assets/sga.svg";
    import ForgotForm from "$lib/components/forgot-form.svelte";
    import { requestPasswordReset } from "$lib/functions/request-password-reset.remote";
    import { toast } from "svelte-sonner";
    import z from "zod";

    let pending = $state(false);
</script>

<div class="grid min-h-svh lg:grid-cols-2">
    <div class="flex flex-col gap-4 p-6 md:p-10">
        <div class="flex justify-center gap-2 md:justify-start">
            <a href="##" class="flex items-center gap-2 font-medium">
                <div class="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                    <img src={SGA} alt="SGA Logo" class="size-4" />
                </div>
                Penmen Pride
                <span class="text-sm">By SNHU SGA</span>
            </a>
        </div>
        <div class="flex flex-1 items-center justify-center">
            <div class="w-full max-w-xs">
                <ForgotForm
                    bind:pending
                    {...requestPasswordReset
                        .preflight(z.object({ email: z.email() }))
                        .enhance(async ({ form, data, submit }) => {
                            pending = true;
                            try {
                                await submit();
                                form.reset();
                                toast.success("Password reset requested", {
                                    description:
                                        "If the email is associated with an account, you will receive a password reset email shortly.",
                                });
                            } catch (error: any) {
                                // ignore redirects
                                if (error?.status >= 300 && error?.status < 400) {
                                    throw error;
                                }
                                console.error("forgot failed", error);
                                toast.error("Password reset request failed", { description: error?.body.message });
                            } finally {
                                pending = false;
                            }
                        })}
                />
            </div>
        </div>
    </div>
    <div class="bg-muted relative hidden lg:block">
        <img
            src={CampSNHU}
            alt="A shot of the SNHU green space during the Camp SNHU event"
            class="absolute inset-0 h-full w-full object-cover brightness-[0.75] dark:grayscale"
        />
    </div>
</div>
