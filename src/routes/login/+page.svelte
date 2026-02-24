<script lang="ts">
	import LoginForm from "$lib/components/login-form.svelte";
	import { login } from "$lib/functions/login.remote";
	import { Login } from "$lib/models";
	import CampSNHU from "$lib/assets/CampSNHU.jpg";
	import { toast } from "svelte-sonner";

	let pending = $state(false);
</script>

<div class="grid min-h-svh lg:grid-cols-2">
	<div class="flex flex-col gap-4 p-6 md:p-10">
		<div class="flex flex-1 items-center justify-center">
			<div class="w-full max-w-xs">
				<LoginForm bind:pending {...login.preflight(Login).enhance(async ({ form, data, submit }) => {
                    pending = true;
                    try {
                        await submit();
                        form.reset();
                    } catch (error: any) {
                        // ignore redirects
                        if (error?.status >= 300 && error?.status < 400) {
                            throw error;
                        }
                        console.error("login failed", error);
                        toast.error("Login failed", { description: error?.body.message });
                    } finally {
                        pending = false;
                    }
                })}/>
			</div>
		</div>
	</div>
	<div class="bg-muted relative hidden lg:block">
		<img
			src={CampSNHU}
			alt="A shot of the SNHU green space during the Camp SNHU event"
			class="absolute inset-0 h-full w-full object-cover brightness-[0.75] dark:brightness-[0.55]"
		/>
	</div>
</div>