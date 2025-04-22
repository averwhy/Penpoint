<template>
  <div class="app-container">
    <h1 class="welcome-text">Penmen Pride</h1>
    <NuxtRouteAnnouncer />
  </div>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
  background-color: #1e1e22;
}

.app-container {
  min-height: 100vh;
  width: 100%;
  background-color: #1e1e22;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.welcome-text {
  color: white;
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 2rem;
}
</style>