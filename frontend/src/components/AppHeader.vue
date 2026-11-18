<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const links = [
  { to: { name: 'students' }, label: 'Students' },
  { to: { name: 'courses' }, label: 'Courses' },
  { to: { name: 'enrollments' }, label: 'Enrollments' },
];

const menuOpen = ref(false);
const route = useRoute();

// Close the mobile menu after navigating.
watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false;
  },
);
</script>

<template>
  <header class="app-header">
    <div class="container header-inner">
      <RouterLink :to="{ name: 'students' }" class="brand">
        <img src="/favicon.svg" alt="" width="28" height="28" />
        <span>Student Management</span>
      </RouterLink>

      <button
        type="button"
        class="menu-toggle"
        :aria-expanded="menuOpen"
        aria-controls="main-nav"
        @click="menuOpen = !menuOpen"
      >
        <span class="sr-only">Toggle navigation</span>
        <span aria-hidden="true">&#9776;</span>
      </button>

      <nav id="main-nav" aria-label="Main navigation" :class="{ open: menuOpen }">
        <RouterLink v-for="link in links" :key="link.label" :to="link.to" class="nav-link">
          {{ link.label }}
        </RouterLink>
      </nav>
    </div>
  </header>
</template>
