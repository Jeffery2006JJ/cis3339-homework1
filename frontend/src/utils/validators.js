// Client-side validation that mirrors the Mongoose schemas on the server.
// The server always re-validates; these rules just give faster feedback.

export const STUDENT_ID_PATTERN = /^\d{1,10}$/;
export const PHONE_PATTERN = /^[0-9()+\-.\s]{7,20}$/;
export const ZIP_PATTERN = /^\d{5}(-\d{4})?$/;

export function validateStudent(form, existingIds = []) {
  const errors = {};
  const name = form.name.trim();
  const studentId = form.studentId.trim();
  const phone = form.phone.trim();
  const zip = form.zip.trim();

  if (!name) errors.name = 'Name is required';
  else if (name.length > 100) errors.name = 'Name must be 100 characters or fewer';

  if (!studentId) errors.studentId = 'Student ID is required';
  else if (!STUDENT_ID_PATTERN.test(studentId)) errors.studentId = 'Student ID must be 1 to 10 digits';
  else if (existingIds.includes(studentId)) errors.studentId = `Student ID ${studentId} already exists`;

  if (!phone) errors.phone = 'Phone number is required';
  else if (!PHONE_PATTERN.test(phone)) errors.phone = 'Use digits, spaces, and ( ) + - . only (7-20 characters)';

  if (!zip) errors.zip = 'ZIP code is required';
  else if (!ZIP_PATTERN.test(zip)) errors.zip = 'ZIP code must be 5 digits (e.g. 77001)';

  return errors;
}

export const normalizeCourseId = (value) => value.trim().replace(/\s+/g, ' ').toUpperCase();

export function validateCourse(form, existingIds = []) {
  const errors = {};
  const courseId = normalizeCourseId(form.courseId);
  const name = form.name.trim();

  if (!courseId) errors.courseId = 'Course ID is required';
  else if (courseId.length > 20) errors.courseId = 'Course ID must be 20 characters or fewer';
  else if (existingIds.includes(courseId)) errors.courseId = `Course ${courseId} already exists`;

  if (!name) errors.name = 'Course name is required';
  else if (name.length > 150) errors.name = 'Course name must be 150 characters or fewer';

  return errors;
}
