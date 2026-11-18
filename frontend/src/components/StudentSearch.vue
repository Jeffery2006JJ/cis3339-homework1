<script setup>
import { ref } from 'vue';
import { useStudentStore } from '@/stores/students';

const students = useStudentStore();
const query = ref(students.searchQuery);
const error = ref('');

async function submit() {
  error.value = '';
  if (!query.value.trim()) {
    error.value = 'Enter a student name or ID to search';
    return;
  }
  await students.search(query.value);
}

function clear() {
  query.value = '';
  error.value = '';
  students.clearSearch();
}
</script>

<template>
  <form class="search-form" role="search" novalidate @submit.prevent="submit">
    <div class="field" :class="{ 'has-error': error }">
      <label for="student-search">Student name or ID</label>
      <div class="input-group">
        <input
          id="student-search"
          v-model="query"
          type="search"
          placeholder="e.g. John or 1001"
          autocomplete="off"
          :aria-invalid="error ? 'true' : 'false'"
          :aria-describedby="error ? 'student-search-error' : undefined"
        />
        <button type="submit" class="btn btn-primary" :disabled="students.searching">
          {{ students.searching ? 'Searching…' : 'Search' }}
        </button>
        <button v-if="students.hasSearch" type="button" class="btn btn-secondary" @click="clear">Clear</button>
      </div>
      <p v-if="error" id="student-search-error" class="field-error">{{ error }}</p>
    </div>
  </form>
</template>
