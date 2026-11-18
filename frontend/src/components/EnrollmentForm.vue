<script setup>
import { computed, ref } from 'vue';
import { useStudentStore } from '@/stores/students';
import { useCourseStore } from '@/stores/courses';
import { useEnrollmentStore } from '@/stores/enrollments';
import { useNotificationStore } from '@/stores/notifications';
import SelectField from './SelectField.vue';
import StatusMessage from './StatusMessage.vue';

const students = useStudentStore();
const courses = useCourseStore();
const enrollments = useEnrollmentStore();
const notify = useNotificationStore();

const studentId = ref('');
const courseId = ref('');
const errors = ref({});
const serverError = ref('');
const submitting = ref(false);

const studentOptions = computed(() =>
  students.students.map((s) => ({ value: s.studentId, label: `${s.name} (${s.studentId})` })),
);
const courseOptions = computed(() =>
  courses.courses.map((c) => ({ value: c.courseId, label: `${c.name} (${c.courseId})` })),
);

async function submit() {
  serverError.value = '';
  errors.value = {};
  if (!studentId.value) errors.value.student = 'Select a student';
  if (!courseId.value) errors.value.course = 'Select a course';
  if (Object.keys(errors.value).length) return;

  submitting.value = true;
  try {
    const result = await enrollments.enroll(studentId.value, courseId.value);
    notify.success(result.message);
    studentId.value = '';
  } catch (e) {
    serverError.value = e.message;
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <form class="form" novalidate @submit.prevent="submit">
    <StatusMessage v-if="serverError" variant="error">{{ serverError }}</StatusMessage>

    <SelectField
      id="enroll-student"
      v-model="studentId"
      label="Select Student"
      placeholder="-- Select Student --"
      :options="studentOptions"
      :error="errors.student"
      :disabled="students.loading"
      required
    />
    <SelectField
      id="enroll-course"
      v-model="courseId"
      label="Select Course"
      placeholder="-- Select Course --"
      :options="courseOptions"
      :error="errors.course"
      :disabled="courses.loading"
      required
    />

    <button type="submit" class="btn btn-primary" :disabled="submitting">
      {{ submitting ? 'Enrolling…' : 'Enroll Student' }}
    </button>
  </form>
</template>
