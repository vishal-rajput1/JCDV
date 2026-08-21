import Attendance from '../models/Attendance.js'
import AttendanceRecord from '../models/AttendanceRecord.js'
import Assignment from '../models/Assignment.js'
import AssignmentSubmission from '../models/AssignmentSubmission.js'
import bcrypt from 'bcryptjs'
import { FIELDS } from '../constants/academic.js'
import mongoose from 'mongoose'
import SessionalMarks from '../models/SessionalMarks.js'
import User from '../models/User.js'

const subjectKey = (subject) => `${subject.code}-${subject.semester}-${subject.field}`

const parseAttendanceDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null
  const date = new Date(`${value}T00:00:00.000Z`)
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date
}

const getAssignedSubject = (teacher, subjectId) => {
  if (!mongoose.isValidObjectId(subjectId)) return null
  return teacher.assignedSubjects.id(subjectId)
}

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

export const getAttendanceRoster = async (req, res) => {
  try {
    const { subjectId, date: dateValue } = req.query
    const date = parseAttendanceDate(dateValue)
    if (!date) return res.status(400).json({ message: 'A valid attendance date is required' })

    const teacher = await User.findById(req.user.id).select('assignedSubjects')
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' })
    const subject = getAssignedSubject(teacher, subjectId)
    if (!subject) return res.status(403).json({ message: 'You are not assigned to this subject' })

    const [students, record] = await Promise.all([
      User.find({ role: 'student', semester: subject.semester, field: subject.field })
        .select('name rollNo email').sort({ name: 1 }).lean(),
      AttendanceRecord.findOne({ teacher: teacher._id, subjectAssignment: subject._id, date }).lean(),
    ])
    const statusByStudent = new Map((record?.entries || []).map((entry) => [String(entry.student), entry.present]))

    res.json({
      subject: { id: subject._id, name: subject.name, code: subject.code, semester: subject.semester, field: subject.field },
      saved: Boolean(record),
      students: students.map((student) => ({
        id: student._id,
        name: student.name,
        rollNo: student.rollNo,
        email: student.email,
        present: statusByStudent.has(String(student._id)) ? statusByStudent.get(String(student._id)) : null,
      })),
    })
  } catch (error) {
    console.error('ATTENDANCE ROSTER ERROR:', error)
    res.status(500).json({ message: 'Unable to load attendance roster' })
  }
}

export const saveAttendance = async (req, res) => {
  try {
    const { subjectId, date: dateValue, entries } = req.body
    const date = parseAttendanceDate(dateValue)
    if (!date || !Array.isArray(entries)) return res.status(400).json({ message: 'A date and attendance entries are required' })

    const teacher = await User.findById(req.user.id).select('assignedSubjects')
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' })
    const subject = getAssignedSubject(teacher, subjectId)
    if (!subject) return res.status(403).json({ message: 'You are not assigned to this subject' })

    const roster = await User.find({ role: 'student', semester: subject.semester, field: subject.field }).select('_id').lean()
    const rosterIds = new Set(roster.map((student) => String(student._id)))
    const validEntries = entries.length === roster.length && entries.every((entry) =>
      mongoose.isValidObjectId(entry.studentId) && rosterIds.has(String(entry.studentId)) && typeof entry.present === 'boolean'
    )
    const uniqueEntryIds = new Set(entries.map((entry) => String(entry.studentId)))
    if (!validEntries || uniqueEntryIds.size !== roster.length) {
      return res.status(400).json({ message: 'Attendance must include one valid status for every authorised student' })
    }

    const existingRecord = await AttendanceRecord.findOne({ teacher: teacher._id, subjectAssignment: subject._id, date })
    const previousStatus = new Map((existingRecord?.entries || []).map((entry) => [String(entry.student), entry.present]))
    const normalisedEntries = entries.map((entry) => ({ student: entry.studentId, present: entry.present }))

    if (existingRecord) {
      existingRecord.entries = normalisedEntries
      await existingRecord.save()
    } else {
      await AttendanceRecord.create({
        teacher: teacher._id, subjectAssignment: subject._id, subject: subject.name, code: subject.code,
        semester: subject.semester, field: subject.field, date, entries: normalisedEntries,
      })
    }

    await Promise.all(normalisedEntries.map(async (entry) => {
      const prior = previousStatus.get(String(entry.student))
      const aggregate = await Attendance.findOne({
        student: entry.student, subject: subject.name, code: subject.code, semester: subject.semester,
        $or: [{ field: subject.field }, { field: { $exists: false } }],
      })
      if (!aggregate) {
        await Attendance.create({ student: entry.student, subject: subject.name, code: subject.code, semester: subject.semester, field: subject.field, present: entry.present ? 1 : 0, total: 1 })
        return
      }
      if (typeof prior === 'boolean') {
        aggregate.present = Math.max(0, aggregate.present + (entry.present ? 1 : 0) - (prior ? 1 : 0))
      } else {
        aggregate.present += entry.present ? 1 : 0
        aggregate.total += 1
      }
      aggregate.field = subject.field
      await aggregate.save()
    }))

    const present = normalisedEntries.filter((entry) => entry.present).length
    res.status(existingRecord ? 200 : 201).json({
      message: existingRecord ? 'Attendance updated successfully' : 'Attendance saved successfully',
      summary: { total: normalisedEntries.length, present, absent: normalisedEntries.length - present },
    })
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ message: 'Attendance was updated concurrently. Please reload and try again.' })
    console.error('SAVE ATTENDANCE ERROR:', error)
    res.status(500).json({ message: 'Unable to save attendance' })
  }
}

export const getAttendanceHistory = async (req, res) => {
  try {
    const { subjectId, semester, field, date: dateValue } = req.query
    if (field && !FIELDS.includes(field)) return res.status(400).json({ message: 'Field must be CSE or AIML' })
    if (semester && (!Number.isInteger(Number(semester)) || Number(semester) < 1)) {
      return res.status(400).json({ message: 'Semester must be a positive whole number' })
    }

    const query = { teacher: req.user.id }
    if (subjectId) {
      if (!mongoose.isValidObjectId(subjectId)) return res.status(400).json({ message: 'Invalid subject ID' })
      const teacher = await User.findById(req.user.id).select('assignedSubjects')
      if (!teacher) return res.status(404).json({ message: 'Teacher not found' })
      if (!getAssignedSubject(teacher, subjectId)) return res.status(403).json({ message: 'You are not assigned to this subject' })
      query.subjectAssignment = subjectId
    }
    if (semester) query.semester = Number(semester)
    if (field) query.field = field
    if (dateValue) {
      const date = parseAttendanceDate(dateValue)
      if (!date) return res.status(400).json({ message: 'Invalid attendance date' })
      query.date = date
    }

    const records = await AttendanceRecord.find(query).select('subject code semester field date entries').sort({ date: -1 }).lean()
    res.json(records.map((record) => {
      const present = record.entries.filter((entry) => entry.present).length
      return {
        id: record._id, date: record.date.toISOString().slice(0, 10), subject: record.subject, code: record.code,
        semester: record.semester, field: record.field, total: record.entries.length, present,
        absent: record.entries.length - present, attendance: record.entries.length ? Math.round((present / record.entries.length) * 100) : null,
      }
    }))
  } catch (error) {
    console.error('ATTENDANCE HISTORY ERROR:', error)
    res.status(500).json({ message: 'Unable to load attendance history' })
  }
}

export const getAttendanceHistoryRecord = async (req, res) => {
  try {
    const { recordId } = req.params
    if (!mongoose.isValidObjectId(recordId)) return res.status(400).json({ message: 'Invalid attendance record ID' })
    const record = await AttendanceRecord.findOne({ _id: recordId, teacher: req.user.id })
      .populate('entries.student', 'name rollNo email').lean()
    if (!record) return res.status(404).json({ message: 'Attendance record not found' })

    res.json({
      id: record._id, subject: record.subject, code: record.code, semester: record.semester, field: record.field,
      date: record.date.toISOString().slice(0, 10),
      entries: record.entries.map((entry) => ({ id: entry.student?._id, name: entry.student?.name || 'Removed student', rollNo: entry.student?.rollNo, email: entry.student?.email, present: entry.present })),
    })
  } catch (error) {
    console.error('ATTENDANCE HISTORY DETAIL ERROR:', error)
    res.status(500).json({ message: 'Unable to load attendance record' })
  }
}

export const getSessionalRoster = async (req, res) => {
  try {
    const { subjectId } = req.query
    const teacher = await User.findById(req.user.id).select('assignedSubjects')
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' })
    const subject = getAssignedSubject(teacher, subjectId)
    if (!subject) return res.status(403).json({ message: 'You are not assigned to this subject' })

    const students = await User.find({ role: 'student', semester: subject.semester, field: subject.field })
      .select('name rollNo email').sort({ name: 1 }).lean()
    const marks = await SessionalMarks.find({
      student: { $in: students.map((student) => student._id) }, subject: subject.name, semester: subject.semester,
      $or: [{ field: subject.field }, { field: { $exists: false } }],
    }).lean()
    const marksByStudent = new Map(marks.map((record) => [String(record.student), record]))

    res.json({
      subject: { id: subject._id, name: subject.name, code: subject.code, semester: subject.semester, field: subject.field },
      students: students.map((student) => {
        const record = marksByStudent.get(String(student._id))
        return {
          id: student._id, name: student.name, rollNo: student.rollNo, email: student.email,
          sessional1: record?.sessional1 ?? null, sessional2: record?.sessional2 ?? null,
          sessional3: record?.sessional3 ?? null, assignment: record?.assignment ?? null,
          isPublished: record?.isPublished === true,
        }
      }),
    })
  } catch (error) {
    console.error('SESSIONAL ROSTER ERROR:', error)
    res.status(500).json({ message: 'Unable to load sessional marks roster' })
  }
}

const normaliseMark = (value, maximum) => {
  if (value === '' || value === null || value === undefined) return null
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 && number <= maximum ? number : null
}

export const saveSessionalMarks = async (req, res) => {
  try {
    const { subjectId, entries } = req.body
    if (!Array.isArray(entries)) return res.status(400).json({ message: 'Sessional mark entries are required' })
    const teacher = await User.findById(req.user.id).select('assignedSubjects')
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' })
    const subject = getAssignedSubject(teacher, subjectId)
    if (!subject) return res.status(403).json({ message: 'You are not assigned to this subject' })

    const roster = await User.find({ role: 'student', semester: subject.semester, field: subject.field }).select('_id').lean()
    const rosterIds = new Set(roster.map((student) => String(student._id)))
    const validEntries = entries.length === roster.length && entries.every((entry) =>
      mongoose.isValidObjectId(entry.studentId) && rosterIds.has(String(entry.studentId)) &&
      normaliseMark(entry.sessional1, 20) !== null && normaliseMark(entry.sessional2, 20) !== null &&
      normaliseMark(entry.sessional3, 20) !== null && normaliseMark(entry.assignment, 10) !== null
    )
    if (!validEntries || new Set(entries.map((entry) => String(entry.studentId))).size !== roster.length) {
      return res.status(400).json({ message: 'Enter valid marks for every authorised student' })
    }

    await Promise.all(entries.map(async (entry) => {
      const query = { student: entry.studentId, subject: subject.name, semester: subject.semester, $or: [{ field: subject.field }, { field: { $exists: false } }] }
      const update = {
        $set: {
          sessional1: normaliseMark(entry.sessional1, 20), sessional2: normaliseMark(entry.sessional2, 20),
          sessional3: normaliseMark(entry.sessional3, 20), assignment: normaliseMark(entry.assignment, 10),
          field: subject.field, teacher: teacher._id, isPublished: false, publishedAt: null,
        },
        $setOnInsert: { student: entry.studentId, subject: subject.name, semester: subject.semester },
      }
      await SessionalMarks.findOneAndUpdate(query, update, { upsert: true, new: true, runValidators: true })
    }))
    res.json({ message: 'Marks saved as a draft. Publish them when ready.' })
  } catch (error) {
    console.error('SAVE SESSIONAL MARKS ERROR:', error)
    res.status(500).json({ message: 'Unable to save sessional marks' })
  }
}

export const publishSessionalMarks = async (req, res) => {
  try {
    const { subjectId } = req.body
    const teacher = await User.findById(req.user.id).select('assignedSubjects')
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' })
    const subject = getAssignedSubject(teacher, subjectId)
    if (!subject) return res.status(403).json({ message: 'You are not assigned to this subject' })
    const students = await User.find({ role: 'student', semester: subject.semester, field: subject.field }).select('_id').lean()
    if (!students.length) return res.status(400).json({ message: 'There are no enrolled students to publish marks for' })
    const marksQuery = {
      student: { $in: students.map((student) => student._id) }, subject: subject.name, semester: subject.semester,
      $or: [{ field: subject.field }, { field: { $exists: false } }],
    }
    const savedCount = await SessionalMarks.countDocuments(marksQuery)
    if (savedCount !== students.length) return res.status(400).json({ message: 'Save marks for every student before publishing them' })
    await SessionalMarks.updateMany(marksQuery, { $set: { field: subject.field, teacher: teacher._id, isPublished: true, publishedAt: new Date() } })
    res.json({ message: 'Marks published to the Student Portal' })
  } catch (error) {
    console.error('PUBLISH SESSIONAL MARKS ERROR:', error)
    res.status(500).json({ message: 'Unable to publish sessional marks' })
  }
}

const serialiseAssignment = (assignment) => ({
  id: assignment._id, title: assignment.title, description: assignment.description, subjectId: assignment.subjectAssignment,
  subject: assignment.subject, code: assignment.code, semester: assignment.semester, field: assignment.field,
  deadline: assignment.deadline.toISOString().slice(0, 10), attachmentUrl: assignment.attachmentUrl,
  maximumMarks: assignment.maximumMarks, isPublished: assignment.isPublished, publishedAt: assignment.publishedAt,
})

const validateAssignmentValues = ({ title, description, deadline, attachmentUrl, maximumMarks }) => {
  const parsedDeadline = parseAttendanceDate(deadline)
  const marks = Number(maximumMarks)
  if (!title?.trim() || !description?.trim() || !parsedDeadline || !Number.isFinite(marks) || marks < 1 || marks > 100) return null
  if (attachmentUrl && !/^https?:\/\//i.test(attachmentUrl)) return null
  return { title: title.trim(), description: description.trim(), deadline: parsedDeadline, attachmentUrl: attachmentUrl?.trim() || '', maximumMarks: marks }
}

export const getTeacherAssignments = async (req, res) => {
  try {
    const { subjectId, semester, field } = req.query
    if (field && !FIELDS.includes(field)) return res.status(400).json({ message: 'Field must be CSE or AIML' })
    if (semester && (!Number.isInteger(Number(semester)) || Number(semester) < 1)) return res.status(400).json({ message: 'Semester must be a positive whole number' })
    const query = { teacher: req.user.id }
    if (subjectId) {
      if (!mongoose.isValidObjectId(subjectId)) return res.status(400).json({ message: 'Invalid subject ID' })
      query.subjectAssignment = subjectId
    }
    if (semester) query.semester = Number(semester)
    if (field) query.field = field
    const assignments = await Assignment.find(query).sort({ deadline: 1, createdAt: -1 }).lean()
    res.json(assignments.map(serialiseAssignment))
  } catch (error) {
    console.error('TEACHER ASSIGNMENTS ERROR:', error)
    res.status(500).json({ message: 'Unable to load assignments' })
  }
}

export const createTeacherAssignment = async (req, res) => {
  try {
    const { subjectId } = req.body
    const values = validateAssignmentValues(req.body)
    if (!values) return res.status(400).json({ message: 'Enter a title, description, valid deadline, optional attachment URL, and maximum marks from 1 to 100' })
    const teacher = await User.findById(req.user.id).select('assignedSubjects')
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' })
    const subject = getAssignedSubject(teacher, subjectId)
    if (!subject) return res.status(403).json({ message: 'You are not assigned to this subject' })
    const assignment = await Assignment.create({
      teacher: teacher._id, subjectAssignment: subject._id, subject: subject.name, code: subject.code,
      semester: subject.semester, field: subject.field, ...values,
    })
    res.status(201).json({ message: 'Assignment saved as a draft', assignment: serialiseAssignment(assignment) })
  } catch (error) {
    console.error('CREATE ASSIGNMENT ERROR:', error)
    res.status(500).json({ message: 'Unable to create assignment' })
  }
}

export const updateTeacherAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params
    if (!mongoose.isValidObjectId(assignmentId)) return res.status(400).json({ message: 'Invalid assignment ID' })
    const values = validateAssignmentValues(req.body)
    if (!values) return res.status(400).json({ message: 'Enter a title, description, valid deadline, optional attachment URL, and maximum marks from 1 to 100' })
    const teacher = await User.findById(req.user.id).select('assignedSubjects')
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' })
    const subject = getAssignedSubject(teacher, req.body.subjectId)
    if (!subject) return res.status(403).json({ message: 'You are not assigned to this subject' })
    const assignment = await Assignment.findOneAndUpdate({ _id: assignmentId, teacher: teacher._id }, {
      ...values, subjectAssignment: subject._id, subject: subject.name, code: subject.code, semester: subject.semester, field: subject.field,
      isPublished: false, publishedAt: null,
    }, { new: true, runValidators: true })
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' })
    res.json({ message: 'Assignment updated as a draft', assignment: serialiseAssignment(assignment) })
  } catch (error) {
    console.error('UPDATE ASSIGNMENT ERROR:', error)
    res.status(500).json({ message: 'Unable to update assignment' })
  }
}

export const deleteTeacherAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params
    if (!mongoose.isValidObjectId(assignmentId)) return res.status(400).json({ message: 'Invalid assignment ID' })
    const assignment = await Assignment.findOneAndDelete({ _id: assignmentId, teacher: req.user.id })
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' })
    res.json({ message: 'Assignment deleted' })
  } catch (error) {
    console.error('DELETE ASSIGNMENT ERROR:', error)
    res.status(500).json({ message: 'Unable to delete assignment' })
  }
}

export const publishTeacherAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params
    if (!mongoose.isValidObjectId(assignmentId)) return res.status(400).json({ message: 'Invalid assignment ID' })
    const assignment = await Assignment.findOneAndUpdate({ _id: assignmentId, teacher: req.user.id }, { isPublished: true, publishedAt: new Date() }, { new: true })
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' })
    res.json({ message: 'Assignment published', assignment: serialiseAssignment(assignment) })
  } catch (error) {
    console.error('PUBLISH ASSIGNMENT ERROR:', error)
    res.status(500).json({ message: 'Unable to publish assignment' })
  }
}

export const getTeacherAssignmentSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params
    if (!mongoose.isValidObjectId(assignmentId)) return res.status(400).json({ message: 'Invalid assignment ID' })
    const assignment = await Assignment.findOne({ _id: assignmentId, teacher: req.user.id }).lean()
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' })
    const students = await User.find({ role: 'student', semester: assignment.semester, field: assignment.field })
      .select('name rollNo email').sort({ name: 1 }).lean()
    const submissions = await AssignmentSubmission.find({ assignment: assignment._id }).lean()
    const submissionsByStudent = new Map(submissions.map((submission) => [String(submission.student), submission]))
    const deadline = new Date(assignment.deadline)
    const studentSubmissions = students.map((student) => {
      const submission = submissionsByStudent.get(String(student._id))
      if (!submission) return { studentId: student._id, name: student.name, rollNo: student.rollNo, email: student.email, status: 'Pending', submissionId: null, submittedAt: null, marks: null, feedback: '', attachmentUrl: '' }
      const late = new Date(submission.submittedAt) > deadline
      return {
        studentId: student._id, name: student.name, rollNo: student.rollNo, email: student.email, submissionId: submission._id,
        submittedAt: submission.submittedAt, attachmentUrl: submission.attachmentUrl, marks: submission.marks ?? null, feedback: submission.feedback || '',
        status: submission.status === 'Reviewed' ? 'Reviewed' : late ? 'Late' : 'Submitted',
      }
    })
    res.json({ assignment: serialiseAssignment(assignment), submissions: studentSubmissions })
  } catch (error) {
    console.error('ASSIGNMENT SUBMISSIONS ERROR:', error)
    res.status(500).json({ message: 'Unable to load assignment submissions' })
  }
}

export const reviewAssignmentSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params
    if (!mongoose.isValidObjectId(submissionId)) return res.status(400).json({ message: 'Invalid submission ID' })
    const submission = await AssignmentSubmission.findById(submissionId)
    if (!submission) return res.status(404).json({ message: 'Submission not found' })
    const assignment = await Assignment.findOne({ _id: submission.assignment, teacher: req.user.id })
    if (!assignment) return res.status(403).json({ message: 'You are not authorised to review this submission' })
    const marks = Number(req.body.marks)
    if (!Number.isFinite(marks) || marks < 0 || marks > assignment.maximumMarks) {
      return res.status(400).json({ message: `Marks must be between 0 and ${assignment.maximumMarks}` })
    }
    const feedback = typeof req.body.feedback === 'string' ? req.body.feedback.trim() : ''
    if (feedback.length > 3000) return res.status(400).json({ message: 'Feedback must be 3000 characters or fewer' })
    submission.marks = marks
    submission.feedback = feedback
    submission.status = 'Reviewed'
    await submission.save()
    res.json({ message: 'Submission reviewed successfully' })
  } catch (error) {
    console.error('REVIEW SUBMISSION ERROR:', error)
    res.status(500).json({ message: 'Unable to review submission' })
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
