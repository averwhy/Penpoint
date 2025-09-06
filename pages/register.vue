<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-4">
    <div class="max-w-md w-full space-y-6 p-8 rounded-lg flex flex-col items-center bg-[#141417]">
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold">Request Access</h2>
        <p class="text-sm text-gray-600 mt-1">
          Fill out the form to request an account. <br/>
          This is for Club E-Board (including governing E-Board) members, and OSI Staff only.
        </p>
      </div>
      <div class="relative w-full flex flex-col items-center">
        <UForm :state="formState" @submit.prevent="handleRegister" class="space-y-4 w-full max-w-xs">
          <UFormField label="Name" name="name" class="">
            <UInput v-model="formState.name" placeholder="First name" type="text" class="w-full mb-2" variant="soft" />
          </UFormField>
          <UFormField label="Email" name="email">
            <UInput v-model="formState.email" placeholder="Enter your email" type="email" class="w-full mb-2" variant="soft" />
          </UFormField>
          <UFormField label="Password" name="password">
            <UTooltip text="Must be 8-256 chars, have one uppercase letter and number, and two special chars." :popper="{ placement: 'right' }" :open="passwordFocused">
              <UInput v-model="formState.password" type="password" placeholder="Enter your password" class="w-full mb-4" variant="soft" @focus="passwordFocused = true" @blur="passwordFocused = false"/>
            </UTooltip>
          </UFormField>
          <UFormField label="Student ID" name="studentid" class="">
            <UInput v-model="formState.studentid" placeholder="Student ID" type="text" class="w-full mb-2" variant="soft" />
          </UFormField>
          <UFormField label="Reason" name="reason">
            <UTextarea v-model="formState.reason" size="lg" placeholder="Why do you need access? Make sure to include your club & eboard position." class="w-full" variant="soft" />
          </UFormField>
          <div class="flex justify-center mt-6">
            <UButton 
              type="submit"
              icon="i-material-symbols-person-add-rounded" 
              color="primary"
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
import { UForm, UFormField, UInput, UTextarea, UButton } from '#components';
import { useToast } from "#imports";
const passwordFocused = ref(false);

const formState = reactive({
	name: "",
	email: "",
	password: "",
	studentid: "",
	reason: "",
});

const handleRegister = async () => {
  const toast = useToast();

  if (formState.name === "" || formState.email === "" || formState.password === "" || formState.studentid === "" || formState.reason === ""){
    toast.add?.({
      title: "Validation failed",
      description: "One or more fields were left empty. Double check and try again.",
      color: "error",
		});
    return;
  }

  try {
		// this will throw on non-2xx
		const res = await fetch("/api/register", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(formState),
		});

		if (!res.ok) {
			const errBody = await res.json();
			toast.add?.({
				title: "Validation failed",
				description: JSON.stringify(errBody),
				color: "error",
			});
      return;
		}

		toast.add?.({
			title:
				"Your request has been submitted. You will receive an email from sga@snhu.edu once approved.",
			color: "success",
		});

		formState.name = "";
		formState.email = "";
		formState.password = "";
		formState.studentid = "";
		formState.reason = "";
	} catch (err) {
		const toast = useToast()
    toast.add?.({
			title: "Unknown Internal Error",
			color: "error",
		});
	}
};
</script>

<style>
</style>
