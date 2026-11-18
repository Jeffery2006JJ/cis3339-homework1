import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { api, encode } from '@/api/http';

/** Enrollments and the currently displayed course roster. */
export const useEnrollmentStore = defineStore('enrollments', () => {
  const rosterCourse = ref(null);
  const rosterStudents = ref([]);
  const rosterLoading = ref(false);
  const rosterError = ref('');

  const rosterCount = computed(() => rosterStudents.value.length);

  async function fetchRoster(courseId) {
    rosterLoading.value = true;
    rosterError.value = '';
    try {
      const data = await api.get(`/enrollments?courseId=${encode(courseId)}`);
      rosterCourse.value = data.course;
      rosterStudents.value = data.students;
    } catch (e) {
      rosterError.value = e.message;
      rosterCourse.value = null;
      rosterStudents.value = [];
    } finally {
      rosterLoading.value = false;
    }
  }

  async function enroll(studentId, courseId) {
    const result = await api.post('/enrollments', { studentId, courseId });
    // Keep the roster up to date if it is showing the same course.
    if (rosterCourse.value?.courseId === result.enrollment.course.courseId) {
      await fetchRoster(courseId);
    }
    return result;
  }

  async function unenroll(enrollmentId) {
    const result = await api.delete(`/enrollments/${encode(enrollmentId)}`);
    rosterStudents.value = rosterStudents.value.filter((s) => s.enrollmentId !== enrollmentId);
    return result;
  }

  function removeStudentFromRoster(studentId) {
    rosterStudents.value = rosterStudents.value.filter((s) => s.studentId !== studentId);
  }

  function handleCourseDeleted(courseId) {
    if (rosterCourse.value?.courseId === courseId) {
      rosterCourse.value = null;
      rosterStudents.value = [];
    }
  }

  return {
    rosterCourse,
    rosterStudents,
    rosterLoading,
    rosterError,
    rosterCount,
    fetchRoster,
    enroll,
    unenroll,
    removeStudentFromRoster,
    handleCourseDeleted,
  };
});
