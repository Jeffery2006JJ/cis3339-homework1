<script setup>
import { ref, watch, nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import { useConfirmStore } from '@/stores/confirm';

const store = useConfirmStore();
const { isOpen, title, message, confirmLabel } = storeToRefs(store);

const dialog = ref(null);
const cancelButton = ref(null);

watch(isOpen, async (open) => {
  const el = dialog.value;
  if (!el) return;
  if (open && !el.open) {
    el.showModal();
    await nextTick();
    cancelButton.value?.focus();
  } else if (!open && el.open) {
    el.close();
  }
});

// Escape key / native close counts as "cancel".
function onClose() {
  if (isOpen.value) store.answer(false);
}
</script>

<template>
  <dialog
    ref="dialog"
    class="confirm-dialog"
    aria-labelledby="confirm-title"
    aria-describedby="confirm-message"
    @close="onClose"
  >
    <h2 id="confirm-title">{{ title }}</h2>
    <p id="confirm-message">{{ message }}</p>
    <div class="actions">
      <button ref="cancelButton" type="button" class="btn btn-secondary" @click="store.answer(false)">Cancel</button>
      <button type="button" class="btn btn-danger" @click="store.answer(true)">{{ confirmLabel }}</button>
    </div>
  </dialog>
</template>
