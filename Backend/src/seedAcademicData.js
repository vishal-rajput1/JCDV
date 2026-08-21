import dotenv from 'dotenv'
import mongoose from 'mongoose'

import User from './models/User.js'
import Attendance from './models/Attendance.js'
import SessionalMarks from './models/SessionalMarks.js'

dotenv.config()


const academicData = [

  {
    subject: 'Java Programming',
    code: 'CSE-501',
    color: 'bg-emerald-500',

    attendance: {
      present: 34,
      total: 40,
    },

    marks: {
      sessional1: 17,
      sessional2: 18,
      sessional3: 16,
      assignment: 9,
    },
  },


  {
    subject: 'Database Management',
    code: 'CSE-502',
    color: 'bg-blue-500',

    attendance: {
      present: 37,
      total: 40,
    },

    marks: {
      sessional1: 18,
      sessional2: 17,
      sessional3: 19,
      assignment: 10,
    },
  },


  {
    subject: 'Python Programming',
    code: 'CSE-503',
    color: 'bg-violet-500',

    attendance: {
      present: 38,
      total: 40,
    },

    marks: {
      sessional1: 19,
      sessional2: 18,
      sessional3: 19,
      assignment: 10,
    },
  },


  {
    subject: 'Data Structures',
    code: 'CSE-504',
    color: 'bg-amber-500',

    attendance: {
      present: 29,
      total: 40,
    },

    marks: {
      sessional1: 16,
      sessional2: 15,
      sessional3: 17,
      assignment: 8,
    },
  },

]


const seedAcademicData = async () => {

  try {

    await mongoose.connect(process.env.MONGO_URI)

    console.log('MongoDB connected')


    const students = await User.find({
      role: 'student',
    })


    if (!students.length) {

      console.log('No students found')

      process.exit(1)

    }


    // Remove old academic data
    await Attendance.deleteMany({})
    await SessionalMarks.deleteMany({})


    // Create academic data
    for (const student of students) {

      console.log(
        `Creating academic data for ${student.name}`
      )


      for (const item of academicData) {


        // ===============================
        // ATTENDANCE
        // ===============================

        await Attendance.create({

          student: student._id,

          subject: item.subject,

          code: item.code,

          present: item.attendance.present,

          total: item.attendance.total,

          color: item.color,

          semester: student.semester,

        })


        // ===============================
        // SESSIONAL MARKS
        // ===============================

        await SessionalMarks.create({

          student: student._id,

          subject: item.subject,

          semester: student.semester,

          sessional1: item.marks.sessional1,

          sessional1Max: 20,

          sessional2: item.marks.sessional2,

          sessional2Max: 20,

          sessional3: item.marks.sessional3,

          sessional3Max: 20,

          assignment: item.marks.assignment,

          assignmentMax: 10,

        })

      }

    }


    console.log(
      `✅ Academic data created for ${students.length} students`
    )


    process.exit(0)


  } catch (error) {

    console.error('SEED ERROR:', error)

    process.exit(1)

  }

}


seedAcademicData()