import { Router } from 'express';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { clean, conflict, normalizeCourseId, notFound, requireFields } from '../utils/errors.js';

const router = Router();

/** GET /api/courses -> all courses, sorted by course ID */
router.get('/', async (_req, res) => {
  const courses = await Course.find().sort({ courseId: 1 });
  res.json(courses);
});

/** POST /api/courses { courseId, name } */
router.post('/', async (req, res) => {
  requireFields(req.body, [
    ['courseId', 'Course ID'],
    ['name', 'Course name'],
  ]);

  const data = { courseId: normalizeCourseId(req.body.courseId), name: clean(req.body.name) };

  if (await Course.exists({ courseId: data.courseId })) {
    throw conflict(`A course with ID ${data.courseId} already exists`);
  }

  const course = await Course.create(data);
  res.status(201).json({ message: 'Course added successfully', course });
});

/** DELETE /api/courses/:courseId -> deletes the course and all of its enrollments */
router.delete('/:courseId', async (req, res) => {
  const course = await Course.findOne({ courseId: normalizeCourseId(req.params.courseId) });
  if (!course) throw notFound('Course not found or already deleted');

  const { deletedCount } = await Enrollment.deleteMany({ course: course._id });
  await course.deleteOne();

  res.json({
    message: `Course ${course.courseId} deleted successfully`,
    course,
    enrollmentsRemoved: deletedCount,
  });
});

export default router;
