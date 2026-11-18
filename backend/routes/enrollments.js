import { Router } from 'express';
import Student from '../models/Student.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { badRequest, clean, conflict, normalizeCourseId, notFound, requireFields } from '../utils/errors.js';

const router = Router();

/**
 * GET /api/enrollments?courseId=CIS%203339
 * Returns the course and the students enrolled in it (the course roster).
 */
router.get('/', async (req, res) => {
  const courseId = normalizeCourseId(req.query.courseId);
  if (!courseId) throw badRequest('Select a course to list its students');

  const course = await Course.findOne({ courseId });
  if (!course) throw notFound('Course not found');

  const enrollments = await Enrollment.find({ course: course._id }).populate('student');
  const students = enrollments
    .filter((e) => e.student) // ignore any orphaned record defensively
    .map((e) => ({ ...e.student.toJSON(), enrollmentId: e._id, enrolledAt: e.createdAt }))
    .sort((a, b) => a.name.localeCompare(b.name));

  res.json({ course, students });
});

/** POST /api/enrollments { studentId, courseId } */
router.post('/', async (req, res) => {
  requireFields(req.body, [
    ['studentId', 'Student'],
    ['courseId', 'Course'],
  ]);

  const studentId = clean(req.body.studentId);
  const courseId = normalizeCourseId(req.body.courseId);

  const [student, course] = await Promise.all([
    Student.findOne({ studentId }),
    Course.findOne({ courseId }),
  ]);
  if (!student) throw notFound(`Student ${studentId} does not exist`);
  if (!course) throw notFound(`Course ${courseId} does not exist`);

  if (await Enrollment.exists({ student: student._id, course: course._id })) {
    throw conflict(`${student.name} is already enrolled in ${course.courseId}`);
  }

  const enrollment = await Enrollment.create({ student: student._id, course: course._id });
  res.status(201).json({
    message: `${student.name} enrolled in ${course.courseId} successfully`,
    enrollment: { _id: enrollment._id, student, course, createdAt: enrollment.createdAt },
  });
});

/** DELETE /api/enrollments/:id -> removes one enrollment (drop a student from a course) */
router.delete('/:id', async (req, res) => {
  const enrollment = await Enrollment.findByIdAndDelete(req.params.id);
  if (!enrollment) throw notFound('Enrollment not found or already removed');
  res.json({ message: 'Enrollment removed successfully', enrollment });
});

export default router;
