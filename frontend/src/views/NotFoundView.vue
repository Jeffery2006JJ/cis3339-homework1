<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();
</script>

<template>
  <div class="page not-found">
    <h1>Page not found</h1>
    <p>
      There is no page at <code>{{ route.fullPath }}</code>.
    </p>
    <RouterLink :to="{ name: 'students' }" class="btn btn-primary">Go to Students</RouterLink>
  </div>
</template>
