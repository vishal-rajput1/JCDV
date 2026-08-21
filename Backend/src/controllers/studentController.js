import Attendance from '../models/Attendance.js'
import Announcement from '../models/Announcement.js'
import Assignment from '../models/Assignment.js'
import AssignmentSubmission from '../models/AssignmentSubmission.js'
import mongoose from 'mongoose'
import Notification from '../models/Notification.js'
import SessionalMarks from '../models/SessionalMarks.js'
import User from '../models/User.js'


// ===============================
// GET STUDENT PROFILE
// ===============================

export const getStudentProfile = async (req, res) => {
  try {
    const student = await User.findById(req.user.id)
      .select('-password')

    if (!student) {
      return res.status(404).json({
        message: 'Student not found',
      })
    }

    res.json(student)

  } catch (error) {
    console.error('PROFILE ERROR:', error)

    res.status(500).json({
      message: 'Server error',
    })
  }
}


// ===============================
// GET ATTENDANCE
// ===============================

export const getAttendance = async (req, res) => {
  try {
    const student = await User.findById(req.user.id)
      .select('semester role')

    if (!student) {
      return res.status(404).json({
        message: 'Student not found',
      })
    }

    const attendance = await Attendance.find({
      student: req.user.id,
      semester: student.semester,
    })
      .sort({
        subject: 1,
      })
      .lean()

    res.json(attendance)

  } catch (error) {
    console.error('ATTENDANCE ERROR:', error)

    res.status(500).json({
      message: 'Server error',
    })
  }
}


// ===============================
// GET SESSIONAL MARKS
// ===============================

export const getSessionalMarks = async (req, res) => {
  try {
    const student = await User.findById(req.user.id)
      .select('semester role')

    if (!student) {
      return res.status(404).json({
        message: 'Student not found',
      })
    }

    const marks = await SessionalMarks.find({
      student: req.user.id,
      semester: student.semester,
      isPublished: { $ne: false },
    })
      .sort({
        subject: 1,
      })
      .lean()

    res.json(marks)

  } catch (error) {
    console.error('SESSIONAL MARKS ERROR:', error)

    res.status(500).json({
      message: 'Server error',
    })
  }
}

export const getStudentAssignments = async (req, res) => {
  try {
    const student = await User.findById(req.user.id).select('semester field')
    if (!student) return res.status(404).json({ message: 'Student not found' })
    const assignments = await Assignment.find({ isPublished: true, semester: student.semester, field: student.field }).sort({ deadline: 1 }).lean()
    const submissions = await AssignmentSubmission.find({ student: student._id, assignment: { $in: assignments.map((assignment) => assignment._id) } }).lean()
    const submissionsByAssignment = new Map(submissions.map((submission) => [String(submission.assignment), submission]))
    res.json(assignments.map((assignment) => {
      const submission = submissionsByAssignment.get(String(assignment._id))
      return {
        id: assignment._id, title: assignment.title, description: assignment.description, subject: assignment.subject, code: assignment.code,
        semester: assignment.semester, field: assignment.field, deadline: assignment.deadline.toISOString().slice(0, 10), attachmentUrl: assignment.attachmentUrl,
        maximumMarks: assignment.maximumMarks, submission: submission ? { id: submission._id, attachmentUrl: submission.attachmentUrl, submittedAt: submission.submittedAt, marks: submission.marks ?? null, feedback: submission.feedback || '', status: submission.status } : null,
      }
    }))
  } catch (error) {
    console.error('STUDENT ASSIGNMENTS ERROR:', error)
    res.status(500).json({ message: 'Unable to load assignments' })
  }
}

export const submitStudentAssignment = async (req, res) => {
  try {
    const { assignmentId, attachmentUrl } = req.body
    if (!mongoose.isValidObjectId(assignmentId) || typeof attachmentUrl !== 'string' || !/^https?:\/\//i.test(attachmentUrl.trim())) {
      return res.status(400).json({ message: 'Provide a valid assignment and submission URL' })
    }
    const student = await User.findById(req.user.id).select('name rollNo semester field')
    if (!student) return res.status(404).json({ message: 'Student not found' })
    const assignment = await Assignment.findOne({ _id: assignmentId, isPublished: true, semester: student.semester, field: student.field })
    if (!assignment) return res.status(403).json({ message: 'This assignment is not available to you' })
    const existing = await AssignmentSubmission.findOne({ assignment: assignment._id, student: student._id })
    if (existing?.status === 'Reviewed') return res.status(400).json({ message: 'This submission has already been reviewed and cannot be changed' })
    const submission = existing || new AssignmentSubmission({ assignment: assignment._id, student: student._id })
    submission.attachmentUrl = attachmentUrl.trim()
    submission.submittedAt = new Date()
    submission.status = new Date(submission.submittedAt) > new Date(assignment.deadline) ? 'Late' : 'Submitted'
    await submission.save()
    const teacher = await User.findById(assignment.teacher).select('notificationsEnabled')
    if (teacher?.notificationsEnabled !== false) {
      await Notification.create({ recipient: assignment.teacher, type: 'assignment_submission', title: `New submission: ${assignment.title}`, message: `${student.name}${student.rollNo ? ` (${student.rollNo})` : ''} submitted ${assignment.subject}.`, referenceType: 'AssignmentSubmission', referenceId: submission._id })
    }
    res.status(existing ? 200 : 201).json({ message: existing ? 'Assignment submission updated' : 'Assignment submitted successfully' })
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ message: 'Submission changed concurrently. Please refresh and try again.' })
    console.error('SUBMIT STUDENT ASSIGNMENT ERROR:', error)
    res.status(500).json({ message: 'Unable to submit assignment' })
  }
}

export const getStudentAnnouncements = async (req, res) => {
  try {
    const student = await User.findById(req.user.id).select('semester field')
    if (!student) return res.status(404).json({ message: 'Student not found' })
    const announcements = await Announcement.find({
      isPublished: true,
      publishDate: { $lte: new Date() },
      $or: [
        { audience: 'all' },
        { audience: 'semester', semester: student.semester },
        { audience: 'field', field: student.field },
        { audience: 'subject', semester: student.semester, field: student.field },
      ],
    }).sort({ publishDate: -1, createdAt: -1 }).lean()
    res.json(announcements.map((announcement) => ({ id: announcement._id, title: announcement.title, message: announcement.message, subject: announcement.subject, code: announcement.code, publishDate: announcement.publishDate.toISOString().slice(0, 10) })))
  } catch (error) {
    console.error('STUDENT ANNOUNCEMENTS ERROR:', error)
    res.status(500).json({ message: 'Unable to load announcements' })
  }
}
