<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-4">
    <div class="max-w-md w-full space-y-6 p-8 rounded-lg flex flex-col items-center bg-[#141417]">
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold">Login</h2>
        <p class="text-sm text-gray-700 mt-1">Club E-Board (including governing E-Board) members, and OSI Staff only</p>
      </div>
      
      <div class="relative w-full flex flex-col items-center">
        <UForm :state="formState" class="space-y-2 w-full max-w-xs">
          <UFormField name="email">
            <UInput v-model="formState.email" placeholder="Enter your email" type="email" class="w-full" variant="soft" />
          </UFormField>
          
          <UFormField name="password">
            <UInput v-model="formState.password" type="password" placeholder="Enter your password" class="w-full" variant="soft" />
          </UFormField>
          
          <div class="flex justify-center mt-6">
            <UButton 
              icon="i-material-symbols-login-rounded" 
              color="primary"
              @click="handleLogin"
              aria-label="Login"
            >
              Login
            </UButton>
          </div>

          <NuxtLink to="/register" class="pt-1 text-gray-500 hover:text-gray-400 justify-center flex gap-[20px]">
            I'm looking for access
          </NuxtLink>
        </UForm>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { UForm, UFormField, UInput, UButton } from "#components";
import { loginResponseSchema } from "~/server/utils/models";

const formState = reactive({
	email: "",
	password: "",
});

const handleLogin = async () => {
	const toast = useToast();
	try {
		const response = await $fetch("/api/login", {
			method: "POST",
			body: { ...formState },
		});

		// Validate response with Zod
		const data = loginResponseSchema.parse(response);

		// Store token in secure cookie and redirect
		const token = useCookie("access-token", {
			httpOnly: false, // Needs to be accessible by client for API calls
			secure: true,
			sameSite: "strict",
			maxAge: 60 * 15, // 15 minutes
		});
		token.value = data.accessToken;

		await navigateTo("/dashboard");
		toast.add({ title: `Welcome back, ${data.user.name}!`, color: "success" });
	} catch (error) {
		console.error("Login failed:", error);
		toast.add({
			title: "Something went wrong!",
			description: error instanceof Error ? error.message : String(error),
			color: "error",
		});
		// Handle error (show toast, etc.)
	}
};
</script>

<style>

</style>