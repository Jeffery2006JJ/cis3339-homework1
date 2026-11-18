import { ref } from 'vue';
import { defineStore } from 'pinia';

/** App-wide toast messages (success / error / info) shown by NotificationList. */
export const useNotificationStore = defineStore('notifications', () => {
  const items = ref([]);
  let nextId = 1;

  function dismiss(id) {
    items.value = items.value.filter((item) => item.id !== id);
  }

  function push(type, message, timeout = 5000) {
    const id = nextId++;
    items.value.push({ id, type, message });
    if (timeout > 0) setTimeout(() => dismiss(id), timeout);
    return id;
  }

  const success = (message) => push('success', message);
  const error = (message) => push('error', message, 8000);
  const info = (message) => push('info', message);

  return { items, push, success, error, info, dismiss };
});
