<template>
  <div class="app-wrapper">
    <!-- Website Touch: Sticky Glassmorphism Header -->
    <header class="app-header">
      <div class="header-inner">
        <div>
          <RouterLink to="/" style="font-family: 'Patrick Hand', cursive; color: var(--c2); font-size: 34px; font-weight: bold; letter-spacing: 0;">
            Support Desk
          </RouterLink>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <RouterLink to="/" class="text-accent" style="font-weight: bold;">All Tickets</RouterLink>
          <span class="text-faint">&bull;</span>
          <!-- Web touch: FAB/Box button -->
          <RouterLink to="/tickets/new" class="inline-btn btn-box" style="height: var(--lh); line-height: var(--lh); display: inline-block;">
            + New Ticket
          </RouterLink>
        </div>
      </div>
    </header>

    <div class="container">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </div>
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  height: calc(var(--lh) * 2);
  /* The blur gives a beautiful modern website touch when the notebook lines scroll under it */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: rgba(253, 253, 252, 0.75); 
  border-bottom: 2px dashed rgba(138, 180, 248, 0.2);
}

.header-inner {
  padding-left: 96px; /* align with the margin line in container */
  padding-right: 32px;
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}
</style>
