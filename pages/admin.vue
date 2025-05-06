<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-4">
    <div class="max-w-md w-full space-y-6 p-8 rounded-lg">
      <h2 class="text-2xl font-bold text-center">Admin Login</h2>
      
      <div class="relative">
        <UForm :state="formState" class="space-y-4">
          <!-- Email field with button -->
          <div>
            <UFormGroup label="Email" name="email" class="w-full">
              <div class="flex items-center gap-1">
                <UInput v-model="formState.email" placeholder="Enter your email" type="email" class="flex-grow" />
                <UButton 
                  icon="i-material-symbols-arrow-forward-rounded" 
                  color="primary"
                  :disabled="!formState.email"
                  @click="showPassword = true"
                  v-if="!showPassword"
                  class="ml-1"
                />
              </div>
            </UFormGroup>
          </div>
          
          <!-- Password field and login button -->
          <div v-if="showPassword">
            <UFormGroup 
              label="Password" 
              name="password"
              class="password-field w-full"
            >
              <UInput 
                v-model="formState.password" 
                type="password" 
                placeholder="Enter your password" 
              />
            </UFormGroup>
            
            <div class="flex justify-end mt-4">
              <UButton 
                type="submit" 
                color="primary" 
                @click="handleLogin"
              >
                Login
              </UButton>
            </div>
          </div>
        </UForm>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const showPassword = ref(false);
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
.password-field {
  animation: slideDown 0.5s ease-out forwards;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>