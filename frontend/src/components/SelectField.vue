<script setup>
const model = defineModel({ type: String, default: '' });

defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  placeholder: { type: String, required: true },
  // [{ value, label }]
  options: { type: Array, required: true },
  error: { type: String, default: '' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});
</script>

<template>
  <div class="field" :class="{ 'has-error': error }">
    <label :for="id">
      {{ label }}
      <span v-if="required" class="required" aria-hidden="true">*</span>
    </label>
    <select
      :id="id"
      v-model="model"
      :required="required"
      :disabled="disabled"
      :aria-invalid="error ? 'true' : 'false'"
      :aria-describedby="error ? `${id}-error` : undefined"
    >
      <option value="">{{ placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
    </select>
    <p v-if="error" :id="`${id}-error`" class="field-error">{{ error }}</p>
  </div>
</template>
