import Attendance from '../models/Attendance.js'
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