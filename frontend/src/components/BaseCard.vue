<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  headingId: { type: String, required: true },
});
</script>

<template>
  <section class="card" :aria-labelledby="headingId">
    <header class="card-header">
      <div>
        <h2 :id="headingId">{{ title }}</h2>
        <p v-if="description" class="card-description">{{ description }}</p>
      </div>
      <div v-if="$slots.actions" class="card-actions">
        <slot name="actions" />
      </div>
    </header>
    <slot />
  </section>
</template>
