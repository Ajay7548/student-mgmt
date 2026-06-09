/**
 * studentRoutes.ts
 * -----------------------------------------------------------------------------
 * Maps each HTTP method + URL to the controller function that handles it.
 * A "router" is a mini Express application that we plug into the main app under
 * the `/api` prefix (see app.ts).
 *
 * Final, public-facing endpoints (the `/api` prefix is added in app.ts):
 *   POST   /api/register       → create a new student
 *   GET    /api/students       → get the list of all students
 *   PUT    /api/student/:id     → update a student by id
 *   DELETE /api/student/:id     → delete a student by id
 */

import { Router } from 'express';
import {
  createStudent,
  getStudents,
  updateStudent,
  deleteStudent,
} from '../controllers/studentController';
import { asyncHandler } from '../middleware/asyncHandler';

// Create a fresh router instance to attach our routes to.
const router = Router();

// CREATE — register a new student.
router.post('/register', asyncHandler(createStudent));

// READ — fetch every student.
router.get('/students', asyncHandler(getStudents));

// UPDATE — modify the student whose id matches `:id`.
router.put('/student/:id', asyncHandler(updateStudent));

// DELETE — remove the student whose id matches `:id`.
router.delete('/student/:id', asyncHandler(deleteStudent));

export default router;
