import { Router } from 'express';
import Student from '../models/Student.js';
import Enrollment from '../models/Enrollment.js';
import { badRequest, clean, conflict, notFound, requireFields } from '../utils/errors.js';

const router = Router();

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * GET /api/students            -> all students (sorted by name)
 * GET /api/students?search=jo  -> students whose name contains "jo" (case-insensitive)
 *                                 or whose student ID equals the search text
 */
router.get('/', async (req, res) => {
  const search = clean(req.query.search);
  const filter = search
    ? { $or: [{ name: { $regex: escapeRegex(search), $options: 'i' } }, { studentId: search }] }
    : {};
  const students = await Student.find(filter).sort({ name: 1, studentId: 1 });
  res.json(students);
});

/** GET /api/students/:studentId -> one student */
router.get('/:studentId', async (req, res) => {
  const student = await Student.findOne({ studentId: clean(req.params.studentId) });
  if (!student) throw notFound('Student not found');
  res.json(student);
});

/** POST /api/students { name, studentId, phone, zip } */
router.post('/', async (req, res) => {
  requireFields(req.body, [
    ['name', 'Name'],
    ['studentId', 'Student ID'],
    ['phone', 'Phone'],
    ['zip', 'ZIP code'],
  ]);

  const data = {
    name: clean(req.body.name),
    studentId: clean(req.body.studentId),
    phone: clean(req.body.phone),
    zip: clean(req.body.zip),
  };

  if (await Student.exists({ studentId: data.studentId })) {
    throw conflict(`A student with ID ${data.studentId} already exists`);
  }

  const student = await Student.create(data);
  res.status(201).json({ message: 'Student added successfully', student });
});

/** DELETE /api/students/:studentId -> deletes the student and all of their enrollments */
router.delete('/:studentId', async (req, res) => {
  const studentId = clean(req.params.studentId);
  if (!studentId) throw badRequest('Student ID is required');

  const student = await Student.findOne({ studentId });
  if (!student) throw notFound('Student not found or already deleted');

  const { deletedCount } = await Enrollment.deleteMany({ student: student._id });
  await student.deleteOne();

  res.json({
    message: `Student ${student.name} deleted successfully`,
    student,
    enrollmentsRemoved: deletedCount,
  });
});

export default router;
