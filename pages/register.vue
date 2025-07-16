<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-4">
    <div class="max-w-md w-full space-y-6 p-8 rounded-lg flex flex-col items-center bg-[#141417]">
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold">Request Access</h2>
        <p class="text-sm text-gray-600 mt-1">Fill out the form to request an account.</p>
      </div>
      <div class="relative w-full flex flex-col items-center">
        <UForm :state="formState" class="space-y-4 w-full max-w-xs">
          <UFormGroup label="Email" name="email">
            <UInput v-model="formState.email" placeholder="Enter your email" type="email" class="w-full mb-2" variant="soft" />
          </UFormGroup>
          <UFormGroup label="Password" name="password">
            <UInput v-model="formState.password" type="password" placeholder="Enter your password" class="w-full" variant="soft" />
          </UFormGroup>
          <div class="flex justify-center mt-6">
            <UButton 
              icon="i-material-symbols-person-add-rounded" 
              color="primary"
              @click="handleRegister"
              aria-label="Request Access"
            >
              Request
            </UButton>
          </div>
        </UForm>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const formState = reactive({
	email: "",
	password: "",
});

const handleRegister = async () => {
	try {
		await $fetch("/api/register", {
			method: "POST",
			body: { ...formState },
		});
		useToast().add({
			title:
				"Your request has been submitted. You will recieve an email from sga@snhu.edu once approved.",
			color: "success",
		});
		formState.email = "";
		formState.password = "";
	} catch (error) {
		useToast().add({
			title: "Something went wrong!",
			description: error instanceof Error ? error.message : String(error),
			color: "error",
		});
	}
};
</script>

<style>
</style>
