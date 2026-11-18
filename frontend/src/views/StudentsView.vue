<script setup>
import { computed, onMounted, ref } from 'vue';
import { useStudentStore } from '@/stores/students';
import { useNotificationStore } from '@/stores/notifications';
import { useConfirmStore } from '@/stores/confirm';
import BaseCard from '@/components/BaseCard.vue';
import StudentForm from '@/components/StudentForm.vue';
import StudentSearch from '@/components/StudentSearch.vue';
import StudentTable from '@/components/StudentTable.vue';
import StatusMessage from '@/components/StatusMessage.vue';

const students = useStudentStore();
const notify = useNotificationStore();
const confirm = useConfirmStore();
const busyKey = ref('');

onMounted(() => students.fetchAll({ force: true }));

const listTitle = computed(() => (students.hasSearch ? 'Search Results' : 'All Students'));
const listDescription = computed(() => {
  if (students.hasSearch) {
    const n = students.searchResults.length;
    return `${n} match${n === 1 ? '' : 'es'} for “${students.searchQuery}”`;
  }
  return `${students.count} student${students.count === 1 ? '' : 's'} on file`;
});
const rows = computed(() => (students.hasSearch ? students.searchResults : students.students));
const isLoading = computed(() => (students.hasSearch ? students.searching : students.loading && !students.loaded));
const loadError = computed(() => (students.hasSearch ? students.searchError : students.error));

async function remove(student) {
  const ok = await confirm.ask({
    title: 'Delete student?',
    message: `Delete ${student.name} (ID ${student.studentId})? Their course enrollments will also be removed. This cannot be undone.`,
    confirmLabel: 'Delete',
  });
  if (!ok) return;

  busyKey.value = student.studentId;
  try {
    const result = await students.deleteStudent(student.studentId);
    const extra = result.enrollmentsRemoved
      ? ` ${result.enrollmentsRemoved} enrollment${result.enrollmentsRemoved === 1 ? '' : 's'} removed.`
      : '';
    notify.success(`Student ${student.name} deleted.${extra}`);
  } catch (e) {
    notify.error(e.message);
    if (e.status === 404) students.fetchAll({ force: true });
  } finally {
    busyKey.value = '';
  }
}
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1>Students</h1>
      <p>Add students, search by name or ID, and remove student records.</p>
    </header>

    <div class="grid">
      <BaseCard title="Add a Student" heading-id="add-student-heading" description="All fields are required.">
        <StudentForm />
      </BaseCard>

      <div class="stack">
        <BaseCard title="Search for a Student" heading-id="search-student-heading">
          <StudentSearch />
        </BaseCard>

        <BaseCard :title="listTitle" :description="listDescription" heading-id="student-list-heading">
          <template v-if="!students.hasSearch" #actions>
            <button
              type="button"
              class="btn btn-secondary btn-sm"
              :disabled="students.loading"
              @click="students.fetchAll({ force: true })"
            >
              Refresh
            </button>
          </template>

          <StatusMessage v-if="isLoading" variant="loading">Loading students…</StatusMessage>
          <StatusMessage v-else-if="loadError" variant="error">{{ loadError }}</StatusMessage>
          <StatusMessage v-else-if="rows.length === 0" variant="empty">
            {{ students.hasSearch ? 'Cannot find a student matching your search.' : 'No students yet. Add one using the form.' }}
          </StatusMessage>
          <StudentTable v-else :students="rows" :caption="listTitle" :busy-key="busyKey" @action="remove" />
        </BaseCard>
      </div>
    </div>
  </div>
</template>
