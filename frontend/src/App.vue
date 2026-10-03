<template>
  <div class="app-wrapper">
    <!-- Clean nav bar pinned to top of the paper -->
    <nav class="nav-bar">
      <RouterLink to="/" class="nav-logo">SupportDesk</RouterLink>
      <div class="nav-links">
        <RouterLink to="/" class="text-accent">All Tickets</RouterLink>
        <RouterLink to="/tickets/new" class="inline-btn btn-box">+ New Ticket</RouterLink>
      </div>
    </nav>

    <div class="container">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </div>

    <footer class="app-footer">
      Built by&nbsp;<a href="https://ayush-builds.vercel.app/" target="_blank" rel="noopener">Ayush Agarwal</a>
    </footer>
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<style scoped>
.nav-bar {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px 0 96px;
  height: calc(var(--lh) * 2);
  background: var(--c1);
  border-bottom: 1px solid rgba(45, 45, 47, 0.1);
}

.nav-logo {
  font-size: 24px;
  color: var(--c2) !important;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 16px;
}

.app-footer {
  padding: 0 40px 0 96px;
  height: calc(var(--lh) * 2);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--c1);
  border-top: 1px solid rgba(45, 45, 47, 0.1);
  font-size: 16px;
}
.app-footer a {
  color: var(--c3);
}
</style>
