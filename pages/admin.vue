<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-4">
    <div class="max-w-md w-full space-y-6 p-8 rounded-lg flex flex-col items-center">
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold">Admin Login</h2>
        <p class="text-sm text-gray-600 mt-1">Authorized access only.</p>
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
              icon="i-material-symbols-login-rounded" 
              color="primary"
              @click="handleLogin"
              aria-label="Login"
            >
              Login
            </UButton>
          </div>
        </UForm>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const formState = reactive({
  email: '',
  password: ''
});

const handleLogin = () => {
  // Here you would implement the actual login logic
  console.log('Login attempt:', formState);
  // For example, check credentials against a database or make an API call
};
</script>

<style>
/* Remove animation styles that are no longer needed */
</style>