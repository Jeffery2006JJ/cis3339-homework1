<script setup>
import { computed, onMounted } from 'vue';
import { useStudentStore } from '@/stores/students';
import { useCourseStore } from '@/stores/courses';
import BaseCard from '@/components/BaseCard.vue';
import EnrollmentForm from '@/components/EnrollmentForm.vue';
import CourseRoster from '@/components/CourseRoster.vue';
import StatusMessage from '@/components/StatusMessage.vue';

const students = useStudentStore();
const courses = useCourseStore();

// Always load fresh options from the backend.
onMounted(() => Promise.all([students.fetchAll({ force: true }), courses.fetchAll({ force: true })]));

const loading = computed(() => (students.loading && !students.loaded) || (courses.loading && !courses.loaded));
const loadError = computed(() => students.error || courses.error);
const missingData = computed(() => students.loaded && courses.loaded && (students.count === 0 || courses.count === 0));
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1>Enrollments</h1>
      <p>Enroll students in courses and view the students enrolled in each course.</p>
    </header>

    <StatusMessage v-if="loading" variant="loading">Loading students and courses…</StatusMessage>
    <StatusMessage v-else-if="loadError" variant="error">{{ loadError }}</StatusMessage>
    <StatusMessage v-else-if="missingData" variant="empty">
      You need at least one student and one course to create an enrollment.
      <RouterLink v-if="students.count === 0" :to="{ name: 'students' }">Add a student</RouterLink>
      <template v-if="students.count === 0 && courses.count === 0"> &middot; </template>
      <RouterLink v-if="courses.count === 0" :to="{ name: 'courses' }">Add a course</RouterLink>
    </StatusMessage>

    <div class="grid">
      <BaseCard title="Enroll Student in Course" heading-id="enroll-heading">
        <EnrollmentForm />
      </BaseCard>

      <BaseCard title="Students in Course" heading-id="roster-heading">
        <CourseRoster />
      </BaseCard>
    </div>
  </div>
</template>
