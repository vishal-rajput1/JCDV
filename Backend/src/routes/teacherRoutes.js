import express from 'express'
import protect, { authorize } from '../middleware/authMiddleware.js'
import {
  changeTeacherPassword,
  getAttendanceRoster,
  getAttendanceHistory,
  getAttendanceHistoryRecord,
  getTeacherDashboard,
  getTeacherProfile,
  getTeacherSubjectById,
  getTeacherSubjects,
  getTeacherStudentById,
  getTeacherStudents,
  getSessionalRoster,
  publishSessionalMarks,
  saveAttendance,
  saveSessionalMarks,
  updateTeacherProfile,
} from '../controllers/teacherController.js'

const router = express.Router()

router.get('/dashboard', protect, authorize('teacher'), getTeacherDashboard)
router.get('/profile', protect, authorize('teacher'), getTeacherProfile)
router.get('/subjects', protect, authorize('teacher'), getTeacherSubjects)
router.get('/subjects/:subjectId', protect, authorize('teacher'), getTeacherSubjectById)
router.get('/students', protect, authorize('teacher'), getTeacherStudents)
router.get('/students/:studentId', protect, authorize('teacher'), getTeacherStudentById)
router.get('/attendance/roster', protect, authorize('teacher'), getAttendanceRoster)
router.get('/attendance/history', protect, authorize('teacher'), getAttendanceHistory)
router.get('/attendance/history/:recordId', protect, authorize('teacher'), getAttendanceHistoryRecord)
router.post('/attendance', protect, authorize('teacher'), saveAttendance)
router.get('/sessionals/roster', protect, authorize('teacher'), getSessionalRoster)
router.post('/sessionals', protect, authorize('teacher'), saveSessionalMarks)
router.put('/sessionals/publish', protect, authorize('teacher'), publishSessionalMarks)
router.put('/profile', protect, authorize('teacher'), updateTeacherProfile)
router.put('/profile/password', protect, authorize('teacher'), changeTeacherPassword)

export default router
