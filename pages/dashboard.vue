<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-4">
    <div class="max-w-md w-full space-y-6 p-8 rounded-lg bg-gray-800 shadow-lg">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p v-if="user" class="text-lg text-gray-600">
          Hello, <span class="font-semibold text-gray-900">{{ user.name }}</span>!
        </p>
      </div>
      
      <div class="flex justify-center mt-6">
        <UButton 
          icon="i-material-symbols-logout-rounded"
          color="error"
          variant="outline"
          @click="handleLogout"
        >
          Logout
        </UButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { type User, userSchema } from "~/server/utils/models";

definePageMeta({
	middleware: "auth",
});

const user = ref<User | null>(null);

onMounted(async () => {
	const toast = useToast();
	try {
		const token = useCookie("access-token");

		if (!token.value) {
			await navigateTo("/login");
			return;
		}

		const response = await $fetch("/api/user", {
			headers: {
				Authorization: `Bearer ${token.value}`,
			},
		});

		const data = userSchema.parse(response);
		user.value = data;
	} catch (error) {
		console.error("Authentication failed:", error);
		const token = useCookie("access-token");
		token.value = null;
		toast.add({
			title: "Authentication failed",
			color: "error",
		});
		await navigateTo("/login");
	}
});

const handleLogout = async () => {
	try {
		const token = useCookie("access-token");

		await $fetch("/api/logout", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token.value}`,
			},
		});

		token.value = null;
		await navigateTo("/login");
	} catch (error) {
		console.error("Logout failed:", error);
		const token = useCookie("access-token");
		token.value = null;
		await navigateTo("/login");
	}
};
</script>
