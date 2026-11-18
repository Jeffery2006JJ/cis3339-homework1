<script setup>
import { onMounted, ref } from 'vue';
import { useCourseStore } from '@/stores/courses';
import { useNotificationStore } from '@/stores/notifications';
import { useConfirmStore } from '@/stores/confirm';
import BaseCard from '@/components/BaseCard.vue';
import CourseForm from '@/components/CourseForm.vue';
import CourseTable from '@/components/CourseTable.vue';
import StatusMessage from '@/components/StatusMessage.vue';

const courses = useCourseStore();
const notify = useNotificationStore();
const confirm = useConfirmStore();
const busyKey = ref('');

onMounted(() => courses.fetchAll({ force: true }));

async function remove(course) {
  const ok = await confirm.ask({
    title: 'Delete course?',
    message: `Delete ${course.courseId} (${course.name})? All enrollments in this course will also be removed. This cannot be undone.`,
    confirmLabel: 'Delete',
  });
  if (!ok) return;

  busyKey.value = course.courseId;
  try {
    const result = await courses.deleteCourse(course.courseId);
    const extra = result.enrollmentsRemoved
      ? ` ${result.enrollmentsRemoved} enrollment${result.enrollmentsRemoved === 1 ? '' : 's'} removed.`
      : '';
    notify.success(`Course ${course.courseId} deleted.${extra}`);
  } catch (e) {
    notify.error(e.message);
    if (e.status === 404) courses.fetchAll({ force: true });
  } finally {
    busyKey.value = '';
  }
}
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1>Courses</h1>
      <p>Add courses, view the course list, and remove courses.</p>
    </header>

    <div class="grid">
      <BaseCard title="Add a Course" heading-id="add-course-heading" description="All fields are required.">
        <CourseForm />
      </BaseCard>

      <BaseCard
        title="Courses List"
        heading-id="course-list-heading"
        :description="`${courses.count} course${courses.count === 1 ? '' : 's'}`"
      >
        <template #actions>
          <button
            type="button"
            class="btn btn-secondary btn-sm"
            :disabled="courses.loading"
            @click="courses.fetchAll({ force: true })"
          >
            {{ courses.loading ? 'Loading…' : 'List Courses' }}
          </button>
        </template>

        <StatusMessage v-if="courses.loading && !courses.loaded" variant="loading">Loading courses…</StatusMessage>
        <StatusMessage v-else-if="courses.error" variant="error">{{ courses.error }}</StatusMessage>
        <StatusMessage v-else-if="courses.count === 0" variant="empty">
          No courses yet. Add one using the form.
        </StatusMessage>
        <CourseTable v-else :courses="courses.courses" :busy-key="busyKey" @delete="remove" />
      </BaseCard>
    </div>
  </div>
</template>
