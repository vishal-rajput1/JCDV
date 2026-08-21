import express from 'express'

import protect, {
  authorize,
} from '../middleware/authMiddleware.js'

import {
  getStudentProfile,
  getAttendance,
  getSessionalMarks,
} from '../controllers/studentController.js'

const router = express.Router()


// Student profile
router.get(
  '/profile',
  protect,
  authorize('student'),
  getStudentProfile
)


// Attendance
router.get(
  '/attendance',
  protect,
  authorize('student'),
  getAttendance
)


// Sessional marks
router.get(
  '/sessionals',
  protect,
  authorize('student'),
  getSessionalMarks
)


export default router