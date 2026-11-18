<script setup>
import { reactive, ref } from 'vue';
import { useStudentStore } from '@/stores/students';
import { useNotificationStore } from '@/stores/notifications';
import { validateStudent } from '@/utils/validators';
import FormField from './FormField.vue';
import StatusMessage from './StatusMessage.vue';

const students = useStudentStore();
const notify = useNotificationStore();

const emptyForm = () => ({ name: '', studentId: '', phone: '', zip: '' });
const form = reactive(emptyForm());
const errors = ref({});
const serverError = ref('');
const submitting = ref(false);

async function submit() {
  serverError.value = '';
  errors.value = validateStudent(form, students.studentIds);
  if (Object.keys(errors.value).length) return;

  submitting.value = true;
  try {
    const student = await students.addStudent({
      name: form.name.trim(),
      studentId: form.studentId.trim(),
      phone: form.phone.trim(),
      zip: form.zip.trim(),
    });
    notify.success(`Student ${student.name} (ID ${student.studentId}) added successfully.`);
    Object.assign(form, emptyForm());
    errors.value = {};
  } catch (e) {
    serverError.value = e.message;
    if (e.status === 409) errors.value = { studentId: e.message };
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
      id="student-name"
      v-model="form.name"
      label="Name"
      autocomplete="name"
      maxlength="100"
      placeholder="e.g. John"
      :error="errors.name"
      required
    />
    <div class="field-row">
      <FormField
        id="student-id"
        v-model="form.studentId"
        label="Student ID"
        inputmode="numeric"
        maxlength="10"
        placeholder="e.g. 1001"
        :error="errors.studentId"
        required
      />
      <FormField
        id="student-zip"
        v-model="form.zip"
        label="ZIP code"
        inputmode="numeric"
        autocomplete="postal-code"
        maxlength="10"
        placeholder="e.g. 77001"
        :error="errors.zip"
        required
      />
    </div>
    <FormField
      id="student-phone"
      v-model="form.phone"
      label="Phone"
      type="tel"
      autocomplete="tel"
      maxlength="20"
      placeholder="e.g. 555-1234"
      :error="errors.phone"
      required
    />

    <button type="submit" class="btn btn-primary" :disabled="submitting">
      {{ submitting ? 'Adding…' : 'Add Student' }}
    </button>
  </form>
</template>
