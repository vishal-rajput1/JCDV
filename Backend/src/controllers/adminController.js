import User from '../models/User.js'
import { FIELDS } from '../constants/academic.js'

export const getAcademicSetup = async (req, res) => {
  try {
    const [teachers, students] = await Promise.all([
      User.find({ role: 'teacher' }).select('name email employeeId department assignedSubjects').sort({ name: 1 }).lean(),
      User.find({ role: 'student' }).select('name email rollNo semester field').sort({ name: 1 }).lean(),
    ])
    res.json({ teachers, students, fields: FIELDS })
  } catch (error) {
    console.error('ADMIN ACADEMIC SETUP ERROR:', error)
    res.status(500).json({ message: 'Unable to load academic setup' })
  }
}

export const updateStudentField = async (req, res) => {
  try {
    const { studentId } = req.params
    const { field } = req.body
    if (!FIELDS.includes(field)) return res.status(400).json({ message: 'Field must be CSE or AIML' })
    const student = await User.findOneAndUpdate({ _id: studentId, role: 'student' }, { field }, { new: true, runValidators: true }).select('name rollNo semester field')
    if (!student) return res.status(404).json({ message: 'Student not found' })
    res.json({ message: 'Student field updated', student })
  } catch (error) {
    console.error('UPDATE STUDENT FIELD ERROR:', error)
    res.status(500).json({ message: 'Unable to update student field' })
  }
}

export const updateTeacherSubjects = async (req, res) => {
  try {
    const { teacherId } = req.params
    const { assignedSubjects } = req.body
    if (!Array.isArray(assignedSubjects) || !assignedSubjects.every((subject) => typeof subject.name === 'string' && subject.name.trim() && typeof subject.code === 'string' && subject.code.trim() && Number.isInteger(Number(subject.semester)) && Number(subject.semester) > 0 && FIELDS.includes(subject.field))) {
      return res.status(400).json({ message: 'Each subject requires name, code, semester, and Field (CSE or AIML)' })
    }
    const teacher = await User.findOneAndUpdate({ _id: teacherId, role: 'teacher' }, { assignedSubjects: assignedSubjects.map((subject) => ({ name: subject.name.trim(), code: subject.code.trim(), semester: Number(subject.semester), field: subject.field })) }, { new: true, runValidators: true }).select('name employeeId assignedSubjects')
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' })
    res.json({ message: 'Teacher subjects updated', teacher })
  } catch (error) {
    console.error('UPDATE TEACHER SUBJECTS ERROR:', error)
    res.status(500).json({ message: 'Unable to update teacher subjects' })
  }
}
