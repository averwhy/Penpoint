<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-4">
    <div class="max-w-md w-full space-y-6 p-8 rounded-lg flex flex-col items-center bg-[#141417]">
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold">Request Access</h2>
        <p class="text-sm text-gray-600 mt-1">
          Fill out the form to request an account. <br/>
          This is for Club E-Board (including governing board E-Board) members, and OSI Staff only.
        </p>
      </div>
      <div class="relative w-full flex flex-col items-center">
        <UForm :state="formState" class="space-y-4 w-full max-w-xs">
          <UFormGroup label="Name" name="name" class="">
            <UInput v-model="formState.name" placeholder="First name" type="text" class="w-full mb-2" variant="soft" />
          </UFormGroup>
          <UFormGroup label="Email" name="email">
            <UInput v-model="formState.email" placeholder="Enter your email" type="email" class="w-full mb-2" variant="soft" />
          </UFormGroup>
          <UFormGroup label="Password" name="password">
            <UTooltip text="Must be 8-256 chars, have one uppercase letter and number, and two special chars." :popper="{ placement: 'right' }" :open="passwordFocused">
              <UInput v-model="formState.password" type="password" placeholder="Enter your password" class="w-full mb-4" variant="soft" @focus="passwordFocused = true" @blur="passwordFocused = false"/>
            </UTooltip>
          </UFormGroup>
          <UFormGroup label="Student ID" name="studentid" class="">
            <UInput v-model="formState.studentid" placeholder="Student ID" type="text" class="w-full mb-2" variant="soft" />
          </UFormGroup>
          <UFormGroup label="Reason" name="reason">
            <UTextarea v-model="formState.reason" size="lg" placeholder="Why do you need access? Make sure to include your club & eboard position." class="w-full" variant="soft" />
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
const passwordFocused = ref(false);

const formState = reactive({
  name: "",
	email: "",
	password: "",
  studentid: "",
  reason: ""
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
