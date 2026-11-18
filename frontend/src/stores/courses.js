import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { api, encode } from '@/api/http';
import { useEnrollmentStore } from './enrollments';

const byCourseId = (a, b) => a.courseId.localeCompare(b.courseId);

/** Courses: shared by the Courses view and the Enrollments view. */
export const useCourseStore = defineStore('courses', () => {
  const courses = ref([]);
  const loading = ref(false);
  const loaded = ref(false);
  const error = ref('');

  const count = computed(() => courses.value.length);
  const courseIds = computed(() => courses.value.map((c) => c.courseId));

  async function fetchAll({ force = false } = {}) {
    if (loaded.value && !force) return;
    loading.value = true;
    error.value = '';
    try {
      courses.value = await api.get('/courses');
      loaded.value = true;
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  async function addCourse(data) {
    const { course } = await api.post('/courses', data);
    courses.value = [...courses.value, course].sort(byCourseId);
    return course;
  }

  async function deleteCourse(courseId) {
    const result = await api.delete(`/courses/${encode(courseId)}`);
    courses.value = courses.value.filter((c) => c.courseId !== courseId);
    useEnrollmentStore().handleCourseDeleted(courseId);
    return result;
  }

  return { courses, loading, loaded, error, count, courseIds, fetchAll, addCourse, deleteCourse };
});
