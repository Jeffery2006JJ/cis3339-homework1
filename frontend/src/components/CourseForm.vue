<script setup>
import { reactive, ref } from 'vue';
import { useCourseStore } from '@/stores/courses';
import { useNotificationStore } from '@/stores/notifications';
import { normalizeCourseId, validateCourse } from '@/utils/validators';
import FormField from './FormField.vue';
import StatusMessage from './StatusMessage.vue';

const courses = useCourseStore();
const notify = useNotificationStore();

const form = reactive({ courseId: '', name: '' });
const errors = ref({});
const serverError = ref('');
const submitting = ref(false);

async function submit() {
  serverError.value = '';
  errors.value = validateCourse(form, courses.courseIds);
  if (Object.keys(errors.value).length) return;

  submitting.value = true;
  try {
    const course = await courses.addCourse({
      courseId: normalizeCourseId(form.courseId),
      name: form.name.trim(),
    });
    notify.success(`Course ${course.courseId} added successfully.`);
    form.courseId = '';
    form.name = '';
    errors.value = {};
  } catch (e) {
    serverError.value = e.message;
    if (e.status === 409) errors.value = { courseId: e.message };
    else if (e.details?.fields) errors.value = e.details.fields;
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <form class="form" novalidate @submit.prevent="submit">
    <StatusMessage v-if="serverError" variant="error">{{ serverError }}</StatusMessage>

    <FormField
      id="course-id"
      v-model="form.courseId"
      label="Course ID"
      maxlength="20"
      placeholder="e.g. CIS 3339"
      hint="Saved in upper case, e.g. CIS 3339"
      :error="errors.courseId"
      required
    />
    <FormField
      id="course-name"
      v-model="form.name"
      label="Course name"
      maxlength="150"
      placeholder="e.g. Enterprise Applications Development"
      :error="errors.name"
      required
    />

    <button type="submit" class="btn btn-primary" :disabled="submitting">
      {{ submitting ? 'Adding…' : 'Add Course' }}
    </button>
  </form>
</template>
