import express from 'express'
import protect, { authorize } from '../middleware/authMiddleware.js'
import { getAcademicSetup, updateStudentField, updateTeacherSubjects } from '../controllers/adminController.js'

const router = express.Router()
router.get('/academic-setup', protect, authorize('admin'), getAcademicSetup)
router.put('/students/:studentId/field', protect, authorize('admin'), updateStudentField)
router.put('/teachers/:teacherId/subjects', protect, authorize('admin'), updateTeacherSubjects)
export default router
