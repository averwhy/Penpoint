<template>
  <div class="points-container">
    <h1 class="title">Points Check</h1>
    <p class="description">Want to know how many points you have? Enter your Student ID here</p>
    <p class="sub-description">All data is cached locally - so your student ID never leaves your computer.</p>
    <div class="search-container px-20 sm:px-35">
      <UInput
        v-model="studentId"
        placeholder="e.g. 1234567"
        type="text"
        maxlength="7"
        variant="soft"
        class="search-input"
        :disabled="isLoading"
      />
      <UButton class="search-button flex items-center justify-center w-24" @click="fetchPoints" :disabled="isLoading">
        <Transition name="fade" mode="out-in">
          <span v-if="!isLoading" key="text" class="flex items-center justify-center">Check</span>
          <span v-else key="spinner" class="flex items-center justify-center w-full">
            <UIcon name="i-heroicons-arrow-path-20-solid" class="animate-spin" />
          </span>
        </Transition>
      </UButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, nextTick } from "vue";

const studentId = ref("");
const isLoading = ref(false);

const fetchPoints = async () => {
	isLoading.value = true;
	await nextTick(); // Ensures the loading state is reflected before continuing
	// This function will be implemented later to handle points checking
	console.log("Checking points for student ID:", studentId.value);
};
</script>

<style scoped>
.points-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  height: 80vh;
}

.title {
  color: white;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  text-align: center;
}

.description {
  color: #bbbbbb;
  font-size: 1.1rem;
  text-align: center;
}

.sub-description {
  color: #858585;
  font-size: 0.9rem;
  text-align: center;
  margin-bottom: 1rem;
}

.search-container {
  display: flex;
  width: 100%;
  max-width: 500px;
  gap: 0.5rem;
}

.search-input {
  flex-grow: 1;
}

.search-button {
  width: 96px; /* fixed width for consistency */
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.fade-enter-to, .fade-leave-from {
  opacity: 1;
}
</style>