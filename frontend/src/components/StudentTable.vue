<script setup>
defineProps({
  students: { type: Array, required: true },
  caption: { type: String, required: true },
  // Text for the action button; set to '' to hide the column.
  actionLabel: { type: String, default: 'Delete' },
  busyKey: { type: String, default: '' },
  rowKey: { type: String, default: 'studentId' },
});

const emit = defineEmits(['action']);
</script>

<template>
  <div class="table-wrap">
    <table class="table">
      <caption class="sr-only">{{ caption }}</caption>
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">ID</th>
          <th scope="col">Phone</th>
          <th scope="col">ZIP</th>
          <th v-if="actionLabel" scope="col" class="col-action">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="student in students" :key="student[rowKey]">
          <td data-label="Name">{{ student.name }}</td>
          <td data-label="ID">{{ student.studentId }}</td>
          <td data-label="Phone">{{ student.phone }}</td>
          <td data-label="ZIP">{{ student.zip }}</td>
          <td v-if="actionLabel" data-label="Action" class="col-action">
            <button
              type="button"
              class="btn btn-danger btn-sm"
              :disabled="busyKey === student[rowKey]"
              :aria-label="`${actionLabel} ${student.name} (ID ${student.studentId})`"
              @click="emit('action', student)"
            >
              {{ busyKey === student[rowKey] ? 'Working…' : actionLabel }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
