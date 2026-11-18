<script setup>
import { computed, ref } from 'vue';
import { useCourseStore } from '@/stores/courses';
import { useEnrollmentStore } from '@/stores/enrollments';
import { useNotificationStore } from '@/stores/notifications';
import { useConfirmStore } from '@/stores/confirm';
import SelectField from './SelectField.vue';
import StatusMessage from './StatusMessage.vue';
import StudentTable from './StudentTable.vue';

const courses = useCourseStore();
const enrollments = useEnrollmentStore();
const notify = useNotificationStore();
const confirm = useConfirmStore();

const courseId = ref(enrollments.rosterCourse?.courseId ?? '');
const error = ref('');
const busyKey = ref('');

const courseOptions = computed(() =>
  courses.courses.map((c) => ({ value: c.courseId, label: `${c.name} (${c.courseId})` })),
);

async function listStudents() {
  error.value = '';
  if (!courseId.value) {
    error.value = 'Select a course';
    return;
  }
  await enrollments.fetchRoster(courseId.value);
}

async function drop(student) {
  const course = enrollments.rosterCourse;
  const ok = await confirm.ask({
    title: 'Remove enrollment?',
    message: `Remove ${student.name} (ID ${student.studentId}) from ${course.courseId}?`,
    confirmLabel: 'Remove',
  });
  if (!ok) return;

  busyKey.value = student.enrollmentId;
  try {
    await enrollments.unenroll(student.enrollmentId);
    notify.success(`${student.name} removed from ${course.courseId}.`);
  } catch (e) {
    notify.error(e.message);
  } finally {
    busyKey.value = '';
  }
}
</script>

<template>
  <div class="stack">
    <form class="inline-form" novalidate @submit.prevent="listStudents">
      <SelectField
        id="roster-course"
        v-model="courseId"
        label="Select Course"
        placeholder="-- Select Course --"
        :options="courseOptions"
        :error="error"
        :disabled="courses.loading"
      />
      <button type="submit" class="btn btn-primary" :disabled="enrollments.rosterLoading">List Students</button>
    </form>

    <StatusMessage v-if="enrollments.rosterLoading" variant="loading">Loading enrolled students…</StatusMessage>
    <StatusMessage v-else-if="enrollments.rosterError" variant="error">{{ enrollments.rosterError }}</StatusMessage>
    <template v-else-if="enrollments.rosterCourse">
      <p class="roster-summary" aria-live="polite">
        <strong>{{ enrollments.rosterCourse.courseId }}</strong> &ndash; {{ enrollments.rosterCourse.name }}:
        {{ enrollments.rosterCount }} student{{ enrollments.rosterCount === 1 ? '' : 's' }} enrolled
      </p>
      <StatusMessage v-if="enrollments.rosterCount === 0" variant="empty">
        No students are enrolled in this course yet.
      </StatusMessage>
      <StudentTable
        v-else
        :students="enrollments.rosterStudents"
        :caption="`Students enrolled in ${enrollments.rosterCourse.courseId}`"
        action-label="Remove"
        row-key="enrollmentId"
        :busy-key="busyKey"
        @action="drop"
      />
    </template>
    <StatusMessage v-else variant="info">Choose a course and select “List Students” to see its roster.</StatusMessage>
  </div>
</template>
