<template>
  <div class="points-container">
    <h1 class="title">Points Check</h1>
    <p class="description">Want to know how many points you have? Enter your Student ID here</p>
    <div class="search-container">
      <UInput
        v-model="studentId"
        placeholder="e.g. 1234567"
        type="text"
        maxlength="7"
        variant="outline"
        class="search-input"
      />
      <UButton class="search-button" @click="fetchPoints">Check</UButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const studentId = ref('');

const fetchPoints = () => {
  // This function will be implemented later to handle points checking
  console.log('Checking points for student ID:', studentId.value);
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
  margin-bottom: 2rem;
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
  min-width: 100px;
  text-align: center;
}
</style>