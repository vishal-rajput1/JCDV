import express from 'express'
import protect, { authorize } from '../middleware/authMiddleware.js'
import {
  changeTeacherPassword,
  createTeacherAnnouncement,
  createTeacherAssignment,
  deleteTeacherAssignment,
  deleteTeacherAnnouncement,
  getAttendanceRoster,
  getAttendanceHistory,
  getAttendanceHistoryRecord,
  getTeacherDashboard,
  getTeacherAssignmentSubmissions,
  getTeacherAnnouncements,
  getTeacherNotifications,
  getTeacherAssignments,
  getTeacherProfile,
  getTeacherSubjectById,
  getTeacherSubjects,
  getTeacherStudentById,
  getTeacherStudents,
  getTeacherTimetable,
  getSessionalRoster,
  publishSessionalMarks,
  publishTeacherAssignment,
  publishTeacherAnnouncement,
  markAllTeacherNotificationsRead,
  markTeacherNotificationRead,
  reviewAssignmentSubmission,
  reviewTeacherRequest,
  saveAttendance,
  saveSessionalMarks,
  updateTeacherAssignment,
  updateTeacherAnnouncement,
  updateTeacherProfile,
  getTeacherRequests,
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
router.get('/assignments', protect, authorize('teacher'), getTeacherAssignments)
router.post('/assignments', protect, authorize('teacher'), createTeacherAssignment)
router.put('/assignments/:assignmentId', protect, authorize('teacher'), updateTeacherAssignment)
router.delete('/assignments/:assignmentId', protect, authorize('teacher'), deleteTeacherAssignment)
router.patch('/assignments/:assignmentId/publish', protect, authorize('teacher'), publishTeacherAssignment)
router.get('/assignments/:assignmentId/submissions', protect, authorize('teacher'), getTeacherAssignmentSubmissions)
router.put('/submissions/:submissionId', protect, authorize('teacher'), reviewAssignmentSubmission)
router.get('/timetable', protect, authorize('teacher'), getTeacherTimetable)
router.get('/announcements', protect, authorize('teacher'), getTeacherAnnouncements)
router.post('/announcements', protect, authorize('teacher'), createTeacherAnnouncement)
router.put('/announcements/:announcementId', protect, authorize('teacher'), updateTeacherAnnouncement)
router.delete('/announcements/:announcementId', protect, authorize('teacher'), deleteTeacherAnnouncement)
router.patch('/announcements/:announcementId/publish', protect, authorize('teacher'), publishTeacherAnnouncement)
router.get('/notifications', protect, authorize('teacher'), getTeacherNotifications)
router.put('/notifications/read-all', protect, authorize('teacher'), markAllTeacherNotificationsRead)
router.put('/notifications/:notificationId/read', protect, authorize('teacher'), markTeacherNotificationRead)
router.get('/requests', protect, authorize('teacher'), getTeacherRequests)
router.put('/requests/:requestId', protect, authorize('teacher'), reviewTeacherRequest)
router.put('/profile', protect, authorize('teacher'), updateTeacherProfile)
router.put('/profile/password', protect, authorize('teacher'), changeTeacherPassword)

export default router
