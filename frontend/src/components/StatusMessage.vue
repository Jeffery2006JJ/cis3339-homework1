<script setup>
// Inline status for loading / empty / error / success states.
defineProps({
  variant: {
    type: String,
    default: 'info',
    validator: (v) => ['info', 'loading', 'empty', 'error', 'success'].includes(v),
  },
});
</script>

<template>
  <div
    class="status"
    :class="`status-${variant}`"
    :role="variant === 'error' ? 'alert' : 'status'"
    :aria-busy="variant === 'loading' ? 'true' : undefined"
  >
    <span v-if="variant === 'loading'" class="spinner" aria-hidden="true"></span>
    <div class="status-body"><slot /></div>
  </div>
</template>
