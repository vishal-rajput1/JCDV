import Attendance from '../models/Attendance.js'
import bcrypt from 'bcryptjs'
import { FIELDS } from '../constants/academic.js'
import mongoose from 'mongoose'
import SessionalMarks from '../models/SessionalMarks.js'
import User from '../models/User.js'

const subjectKey = (subject) => `${subject.code}-${subject.semester}-${subject.field}`

export const getTeacherDashboard = async (req, res) => {
  try {
    const teacher = await User.findById(req.user.id)
      .select('name employeeId email department assignedSubjects')
      .lean()

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' })
    }

    const subjects = teacher.assignedSubjects || []
    const studentFilters = subjects.map(({ semester, field }) => ({ semester, field }))
    const students = studentFilters.length
      ? await User.find({ role: 'student', $or: studentFilters }).select('_id').lean()
      : []

    const studentIds = students.map((student) => student._id)
    const subjectNames = subjects.map((subject) => subject.name)
    const attendance = studentIds.length && subjectNames.length
      ? await Attendance.find({ student: { $in: studentIds }, subject: { $in: subjectNames } })
        .select('present total')
        .lean()
      : []

    const present = attendance.reduce((total, record) => total + record.present, 0)
    const total = attendance.reduce((sum, record) => sum + record.total, 0)

    res.json({
      teacher: {
        name: teacher.name,
        employeeId: teacher.employeeId,
        department: teacher.department,
      },
      stats: {
        subjects: subjects.length,
        students: studentIds.length,
        attendance: total ? Math.round((present / total) * 100) : null,
      },
      subjects: subjects.map((subject) => ({ ...subject, id: subjectKey(subject) })),
      todayClasses: [],
      announcements: [],
      activity: [],
    })
  } catch (error) {
    console.error('TEACHER DASHBOARD ERROR:', error)
    res.status(500).json({ message: 'Unable to load teacher dashboard' })
  }
}

export const getTeacherProfile = async (req, res) => {
  try {
    const teacher = await User.findById(req.user.id)
      .select('name email employeeId phone department designation qualification field assignedSubjects')
      .lean()

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' })
    }

    res.json(teacher)
  } catch (error) {
    console.error('TEACHER PROFILE ERROR:', error)
    res.status(500).json({ message: 'Unable to load teacher profile' })
  }
}

export const getTeacherSubjects = async (req, res) => {
  try {
    const { semester, field, search } = req.query
    const teacher = await User.findById(req.user.id).select('assignedSubjects').lean()
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' })
    }

    if (field && !FIELDS.includes(field)) {
      return res.status(400).json({ message: 'Field must be CSE or AIML' })
    }
    if (semester && (!Number.isInteger(Number(semester)) || Number(semester) < 1)) {
      return res.status(400).json({ message: 'Semester must be a positive whole number' })
    }

    const searchTerm = search?.trim().toLowerCase()
    const subjects = (teacher.assignedSubjects || []).filter((subject) => {
      const matchesSemester = !semester || subject.semester === Number(semester)
      const matchesField = !field || subject.field === field
      const matchesSearch = !searchTerm || `${subject.name} ${subject.code}`.toLowerCase().includes(searchTerm)
      return matchesSemester && matchesField && matchesSearch
    })

    const subjectsWithStudents = await Promise.all(subjects.map(async (subject) => ({
      id: subject._id,
      name: subject.name,
      code: subject.code,
      semester: subject.semester,
      field: subject.field,
      students: await User.countDocuments({ role: 'student', semester: subject.semester, field: subject.field }),
    })))

    res.json(subjectsWithStudents)
  } catch (error) {
    console.error('TEACHER SUBJECTS ERROR:', error)
    res.status(500).json({ message: 'Unable to load assigned subjects' })
  }
}

export const getTeacherSubjectById = async (req, res) => {
  try {
    const { subjectId } = req.params
    if (!mongoose.isValidObjectId(subjectId)) {
      return res.status(400).json({ message: 'Invalid subject ID' })
    }

    const teacher = await User.findById(req.user.id).select('name department assignedSubjects')
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' })
    }

    const subject = teacher.assignedSubjects.id(subjectId)
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found or not assigned to you' })
    }

    const students = await User.countDocuments({
      role: 'student',
      semester: subject.semester,
      field: subject.field,
    })

    res.json({
      id: subject._id,
      name: subject.name,
      code: subject.code,
      semester: subject.semester,
      field: subject.field,
      students,
      teacher: { name: teacher.name, department: teacher.department },
    })
  } catch (error) {
    console.error('TEACHER SUBJECT DETAIL ERROR:', error)
    res.status(500).json({ message: 'Unable to load subject details' })
  }
}

export const getTeacherStudents = async (req, res) => {
  try {
    const { semester, field, subjectId, search } = req.query
    const teacher = await User.findById(req.user.id).select('assignedSubjects')
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' })

    if (field && !FIELDS.includes(field)) return res.status(400).json({ message: 'Field must be CSE or AIML' })
    if (semester && (!Number.isInteger(Number(semester)) || Number(semester) < 1)) {
      return res.status(400).json({ message: 'Semester must be a positive whole number' })
    }

    let assignments = teacher.assignedSubjects || []
    if (subjectId) {
      if (!mongoose.isValidObjectId(subjectId)) return res.status(400).json({ message: 'Invalid subject ID' })
      const assignment = assignments.id(subjectId)
      if (!assignment) return res.status(403).json({ message: 'You are not assigned to this subject' })
      assignments = [assignment]
    }
    assignments = assignments.filter((assignment) =>
      (!semester || assignment.semester === Number(semester)) && (!field || assignment.field === field)
    )
    if (!assignments.length) return res.json([])

    const scopeMap = new Map(assignments.map((assignment) => [`${assignment.semester}-${assignment.field}`, assignment]))
    const studentQuery = {
      role: 'student',
      $or: [...scopeMap.keys()].map((key) => {
        const [assignedSemester, assignedField] = key.split('-')
        return { semester: Number(assignedSemester), field: assignedField }
      }),
    }
    if (search?.trim()) {
      const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      studentQuery.$and = [{ $or: [{ name: new RegExp(safeSearch, 'i') }, { rollNo: new RegExp(safeSearch, 'i') }] }]
    }

    const students = await User.find(studentQuery).select('name rollNo email semester field').sort({ name: 1 }).lean()
    const studentIds = students.map((student) => student._id)
    const subjectNames = [...new Set(assignments.map((assignment) => assignment.name))]
    const [attendanceRecords, markRecords] = await Promise.all([
      Attendance.find({ student: { $in: studentIds }, subject: { $in: subjectNames } }).select('student present total').lean(),
      SessionalMarks.find({ student: { $in: studentIds }, subject: { $in: subjectNames } }).select('student sessional1 sessional2 sessional3 assignment sessional1Max sessional2Max sessional3Max assignmentMax').lean(),
    ])

    const attendanceByStudent = new Map()
    attendanceRecords.forEach((record) => {
      const key = String(record.student)
      const current = attendanceByStudent.get(key) || { present: 0, total: 0 }
      current.present += record.present
      current.total += record.total
      attendanceByStudent.set(key, current)
    })
    const marksByStudent = new Map()
    markRecords.forEach((record) => {
      const key = String(record.student)
      const current = marksByStudent.get(key) || { scored: 0, maximum: 0 }
      current.scored += record.sessional1 + record.sessional2 + record.sessional3 + record.assignment
      current.maximum += record.sessional1Max + record.sessional2Max + record.sessional3Max + record.assignmentMax
      marksByStudent.set(key, current)
    })

    res.json(students.map((student) => {
      const attendance = attendanceByStudent.get(String(student._id))
      const performance = marksByStudent.get(String(student._id))
      return {
        id: student._id,
        name: student.name,
        rollNo: student.rollNo,
        email: student.email,
        semester: student.semester,
        field: student.field,
        attendance: attendance?.total ? Math.round((attendance.present / attendance.total) * 100) : null,
        performance: performance?.maximum ? Math.round((performance.scored / performance.maximum) * 100) : null,
      }
    }))
  } catch (error) {
    console.error('TEACHER STUDENTS ERROR:', error)
    res.status(500).json({ message: 'Unable to load students' })
  }
}

export const getTeacherStudentById = async (req, res) => {
  try {
    const { studentId } = req.params
    if (!mongoose.isValidObjectId(studentId)) return res.status(400).json({ message: 'Invalid student ID' })

    const [teacher, student] = await Promise.all([
      User.findById(req.user.id).select('assignedSubjects').lean(),
      User.findOne({ _id: studentId, role: 'student' }).select('name rollNo email phone semester field').lean(),
    ])
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' })
    if (!student) return res.status(404).json({ message: 'Student not found' })

    const assignments = (teacher.assignedSubjects || []).filter((assignment) =>
      assignment.semester === student.semester && assignment.field === student.field
    )
    if (!assignments.length) return res.status(403).json({ message: 'You are not authorised to view this student' })

    const subjectNames = [...new Set(assignments.map((assignment) => assignment.name))]
    const [attendanceRecords, markRecords] = await Promise.all([
      Attendance.find({ student: student._id, subject: { $in: subjectNames } }).select('subject present total').sort({ subject: 1 }).lean(),
      SessionalMarks.find({ student: student._id, subject: { $in: subjectNames } })
        .select('subject sessional1 sessional2 sessional3 assignment sessional1Max sessional2Max sessional3Max assignmentMax')
        .sort({ subject: 1 }).lean(),
    ])

    const attendancePresent = attendanceRecords.reduce((sum, record) => sum + record.present, 0)
    const attendanceTotal = attendanceRecords.reduce((sum, record) => sum + record.total, 0)
    const marksScored = markRecords.reduce((sum, record) => sum + record.sessional1 + record.sessional2 + record.sessional3 + record.assignment, 0)
    const marksMaximum = markRecords.reduce((sum, record) => sum + record.sessional1Max + record.sessional2Max + record.sessional3Max + record.assignmentMax, 0)

    res.json({
      student: { id: student._id, name: student.name, rollNo: student.rollNo, email: student.email, phone: student.phone, semester: student.semester, field: student.field },
      summary: {
        attendance: attendanceTotal ? Math.round((attendancePresent / attendanceTotal) * 100) : null,
        performance: marksMaximum ? Math.round((marksScored / marksMaximum) * 100) : null,
        assignments: assignments.map(({ _id, name, code }) => ({ id: _id, name, code })),
      },
      attendance: attendanceRecords.map((record) => ({ ...record, percentage: record.total ? Math.round((record.present / record.total) * 100) : null })),
      marks: markRecords,
    })
  } catch (error) {
    console.error('TEACHER STUDENT DETAIL ERROR:', error)
    res.status(500).json({ message: 'Unable to load student details' })
  }
}

export const updateTeacherProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'email', 'phone', 'designation', 'qualification']
    const updates = Object.fromEntries(
      allowedFields
        .filter((field) => Object.hasOwn(req.body, field))
        .map((field) => [field, typeof req.body[field] === 'string' ? req.body[field].trim() : req.body[field]])
    )

    if (!Object.keys(updates).length) {
      return res.status(400).json({ message: 'No valid profile changes were provided' })
    }

    if (Object.hasOwn(updates, 'name') && !updates.name) {
      return res.status(400).json({ message: 'Name is required' })
    }
    if (Object.hasOwn(updates, 'email') && !updates.email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    const teacher = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('name email employeeId phone department designation qualification field assignedSubjects')

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' })
    }

    res.json({ message: 'Profile updated successfully', teacher })
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: 'That email address is already in use' })
    }
    console.error('UPDATE TEACHER PROFILE ERROR:', error)
    res.status(500).json({ message: 'Unable to update teacher profile' })
  }
}

export const changeTeacherPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' })
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' })
    }

    const teacher = await User.findById(req.user.id).select('+password')
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' })
    }
    if (!(await bcrypt.compare(currentPassword, teacher.password))) {
      return res.status(400).json({ message: 'Current password is incorrect' })
    }

    teacher.password = await bcrypt.hash(newPassword, 10)
    await teacher.save()
    res.json({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('CHANGE TEACHER PASSWORD ERROR:', error)
    res.status(500).json({ message: 'Unable to change password' })
  }
}
