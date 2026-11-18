<script setup>
import { computed } from 'vue';

const model = defineModel({ type: String, default: '' });

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, default: 'text' },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  autocomplete: { type: String, default: 'off' },
  inputmode: { type: String, default: undefined },
  maxlength: { type: [Number, String], default: undefined },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});

const describedBy = computed(() => {
  const ids = [];
  if (props.hint) ids.push(`${props.id}-hint`);
  if (props.error) ids.push(`${props.id}-error`);
  return ids.join(' ') || undefined;
});
</script>

<template>
  <div class="field" :class="{ 'has-error': error }">
    <label :for="id">
      {{ label }}
      <span v-if="required" class="required" aria-hidden="true">*</span>
    </label>
    <input
      :id="id"
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :inputmode="inputmode"
      :maxlength="maxlength"
      :required="required"
      :disabled="disabled"
      :aria-invalid="error ? 'true' : 'false'"
      :aria-describedby="describedBy"
    />
    <p v-if="hint" :id="`${id}-hint`" class="field-hint">{{ hint }}</p>
    <p v-if="error" :id="`${id}-error`" class="field-error">{{ error }}</p>
  </div>
</template>
