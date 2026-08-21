import express from 'express'
import protect, { authorize } from '../middleware/authMiddleware.js'
import {
  changeTeacherPassword,
  getTeacherDashboard,
  getTeacherProfile,
  getTeacherSubjectById,
  getTeacherSubjects,
  getTeacherStudentById,
  getTeacherStudents,
  updateTeacherProfile,
} from '../controllers/teacherController.js'

const router = express.Router()

router.get('/dashboard', protect, authorize('teacher'), getTeacherDashboard)
router.get('/profile', protect, authorize('teacher'), getTeacherProfile)
router.get('/subjects', protect, authorize('teacher'), getTeacherSubjects)
router.get('/subjects/:subjectId', protect, authorize('teacher'), getTeacherSubjectById)
router.get('/students', protect, authorize('teacher'), getTeacherStudents)
router.get('/students/:studentId', protect, authorize('teacher'), getTeacherStudentById)
router.put('/profile', protect, authorize('teacher'), updateTeacherProfile)
router.put('/profile/password', protect, authorize('teacher'), changeTeacherPassword)

export default router
