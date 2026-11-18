<script setup>
defineProps({
  courses: { type: Array, required: true },
  busyKey: { type: String, default: '' },
});

const emit = defineEmits(['delete']);
</script>

<template>
  <div class="table-wrap">
    <table class="table">
      <caption class="sr-only">All courses</caption>
      <thead>
        <tr>
          <th scope="col">Class ID</th>
          <th scope="col">Class Name</th>
          <th scope="col" class="col-action">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="course in courses" :key="course.courseId">
          <td data-label="Class ID" class="nowrap">{{ course.courseId }}</td>
          <td data-label="Class Name">{{ course.name }}</td>
          <td data-label="Action" class="col-action">
            <button
              type="button"
              class="btn btn-danger btn-sm"
              :disabled="busyKey === course.courseId"
              :aria-label="`Delete course ${course.courseId} ${course.name}`"
              @click="emit('delete', course)"
            >
              {{ busyKey === course.courseId ? 'Deleting…' : 'Delete' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
