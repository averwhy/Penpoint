<template>
  <UApp>
    <div class="navbar">
      <div class="navbar-content">
        <NuxtLink to="/" class="logo-container">
          <img src="/penmenpridelogo.png" alt="Penmen Pride Logo" class="navbar-logo" />
        </NuxtLink>
        <div class="nav-links">
          <NuxtLink to="/" class="nav-link">Home</NuxtLink>
          <NuxtLink to="/points" class="nav-link">Points Check</NuxtLink>
          <UTooltip text="Staff login" placement="right">
            <NuxtLink to="/login" class="nav-link">
              <Icon name="material-symbols:security" />
            </NuxtLink>
          </UTooltip>
        </div>
      </div>
    </div>
    <main class="main-content">
      <NuxtPage />
    </main>
  </UApp>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  background-color: #1e1e22;
}

.navbar {
  width: 100%;
  background-color: #141417;
  position: fixed;
  top: 0;
  left: 0;
  padding: 10px 0;
  z-index: 1000;
}

.navbar-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-container {
  display: flex;
  align-items: center;
}

.navbar-logo {
  height: 40px;
  width: auto;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.admin-link {
  color: white;
  transition: color 0.2s;
  padding-top: 2%;
}

.nav-link:hover {
  color: #bbbbbb;
}

.main-content {
  margin-top: 60px; /* Space for navbar */
  min-height: calc(100vh - 60px);
}
</style>