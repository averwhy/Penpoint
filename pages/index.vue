<template>
  <div class="app-container">
    <img src="/penmenpridelogo.png" alt="Penn Men Pride Logo" class="logo-image" />
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
  background-color: #202027;
}

.app-container {
  min-height: 100vh;
  width: 100%;
  background-color: #202027;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo-image {
  max-width: 80%;
  height: auto;
}
</style>