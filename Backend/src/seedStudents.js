import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

import User from './models/User.js'

dotenv.config()

const students = [
  {
    name: 'Vishal Rajput',
    email: 'vishal.rajput@example.com',
    password: 'Student@123',
    role: 'student',
    rollNo: '2309711678007',
    studentId: 'CSE23001',
    department: 'Computer Science Engineering',
    semester: 5,
  },

  {
    name: 'Rahul Kumar',
    email: 'rahul.kumar@example.com',
    password: 'Student@123',
    role: 'student',
    rollNo: '2309711678008',
    studentId: 'CSE23002',
    department: 'Computer Science Engineering',
    semester: 5,
  },

  {
    name: 'Aman Sharma',
    email: 'aman.sharma@example.com',
    password: 'Student@123',
    role: 'student',
    rollNo: '2309711678009',
    studentId: 'CSE23003',
    department: 'Computer Science Engineering',
    semester: 5,
  },

  {
    name: 'Mohit Kumar',
    email: 'mohit.kumar@example.com',
    password: 'Student@123',
    role: 'student',
    rollNo: '2309711678010',
    studentId: 'CSE23004',
    department: 'Computer Science Engineering',
    semester: 5,
  },

  {
    name: 'Arjun Singh',
    email: 'arjun.singh@example.com',
    password: 'Student@123',
    role: 'student',
    rollNo: '2309711678011',
    studentId: 'CSE23005',
    department: 'Computer Science Engineering',
    semester: 5,
  },

  {
    name: 'Rohit Kumar',
    email: 'rohit.kumar@example.com',
    password: 'Student@123',
    role: 'student',
    rollNo: '2309711678012',
    studentId: 'CSE23006',
    department: 'Computer Science Engineering',
    semester: 5,
  },

  {
    name: 'Deepak Sharma',
    email: 'deepak.sharma@example.com',
    password: 'Student@123',
    role: 'student',
    rollNo: '2309711678013',
    studentId: 'CSE23007',
    department: 'Computer Science Engineering',
    semester: 5,
  },

  {
    name: 'Karan Mehta',
    email: 'karan.mehta@example.com',
    password: 'Student@123',
    role: 'student',
    rollNo: '2309711678014',
    studentId: 'CSE23008',
    department: 'Computer Science Engineering',
    semester: 5,
  },

  {
    name: 'Sahil Kumar',
    email: 'sahil.kumar@example.com',
    password: 'Student@123',
    role: 'student',
    rollNo: '2309711678015',
    studentId: 'CSE23009',
    department: 'Computer Science Engineering',
    semester: 5,
  },

  {
    name: 'Naveen Singh',
    email: 'naveen.singh@example.com',
    password: 'Student@123',
    role: 'student',
    rollNo: '2309711678016',
    studentId: 'CSE23010',
    department: 'Computer Science Engineering',
    semester: 5,
  },
]

const seedStudents = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)

    console.log('MongoDB connected')

    await User.deleteMany({
      role: 'student',
    })

    for (const student of students) {
      const hashedPassword = await bcrypt.hash(
        student.password,
        10
      )

      await User.create({
        ...student,
        password: hashedPassword,
      })
    }

    console.log('10 students created successfully')

    process.exit(0)
  } catch (error) {
    console.error(error)

    process.exit(1)
  }
}

seedStudents()