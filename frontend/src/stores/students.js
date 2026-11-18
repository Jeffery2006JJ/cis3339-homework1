import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { api, encode } from '@/api/http';
import { useEnrollmentStore } from './enrollments';

const byName = (a, b) => a.name.localeCompare(b.name) || a.studentId.localeCompare(b.studentId);

/** Students: shared by the Students view and the Enrollments view. */
export const useStudentStore = defineStore('students', () => {
  const students = ref([]);
  const loading = ref(false);
  const loaded = ref(false);
  const error = ref('');

  // Search state
  const searchQuery = ref('');
  const searchResults = ref([]);
  const searching = ref(false);
  const searchError = ref('');

  const count = computed(() => students.value.length);
  const studentIds = computed(() => students.value.map((s) => s.studentId));
  const hasSearch = computed(() => searchQuery.value !== '');

  async function fetchAll({ force = false } = {}) {
    if (loaded.value && !force) return;
    loading.value = true;
    error.value = '';
    try {
      students.value = await api.get('/students');
      loaded.value = true;
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  async function search(query) {
    const q = query.trim();
    searchQuery.value = q;
    searchError.value = '';
    if (!q) {
      searchResults.value = [];
      return;
    }
    searching.value = true;
    try {
      searchResults.value = await api.get(`/students?search=${encode(q)}`);
    } catch (e) {
      searchError.value = e.message;
      searchResults.value = [];
    } finally {
      searching.value = false;
    }
  }

  function clearSearch() {
    searchQuery.value = '';
    searchResults.value = [];
    searchError.value = '';
  }

  async function addStudent(data) {
    const { student } = await api.post('/students', data);
    students.value = [...students.value, student].sort(byName);
    return student;
  }

  async function deleteStudent(studentId) {
    const result = await api.delete(`/students/${encode(studentId)}`);
    students.value = students.value.filter((s) => s.studentId !== studentId);
    searchResults.value = searchResults.value.filter((s) => s.studentId !== studentId);
    useEnrollmentStore().removeStudentFromRoster(studentId);
    return result;
  }

  return {
    students,
    loading,
    loaded,
    error,
    count,
    studentIds,
    searchQuery,
    searchResults,
    searching,
    searchError,
    hasSearch,
    fetchAll,
    search,
    clearSearch,
    addStudent,
    deleteStudent,
  };
});
