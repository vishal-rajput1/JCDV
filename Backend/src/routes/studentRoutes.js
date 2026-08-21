import express from 'express'

import protect, {
  authorize,
} from '../middleware/authMiddleware.js'

import {
  getStudentProfile,
  getAttendance,
  getSessionalMarks,
  getStudentAnnouncements,
  getStudentAssignments,
  submitStudentAssignment,
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

router.get('/assignments', protect, authorize('student'), getStudentAssignments)
router.post('/assignments/submit', protect, authorize('student'), submitStudentAssignment)
router.get('/announcements', protect, authorize('student'), getStudentAnnouncements)


export default router
