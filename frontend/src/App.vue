<script setup>
import AppHeader from '@/components/AppHeader.vue';
import NotificationList from '@/components/NotificationList.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
</script>

<template>
  <a class="skip-link" href="#main-content">Skip to main content</a>
  <AppHeader />
  <main id="main-content" class="container" tabindex="-1">
    <RouterView />
  </main>
  <footer class="app-footer container">
    CIS 3339 &middot; Student Management System &middot; Vue 3 + Express + MongoDB
  </footer>
  <NotificationList />
  <ConfirmDialog />
</template>
