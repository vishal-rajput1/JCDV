import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      required: true,
    },

    studentId: {
      type: String,
      unique: true,
      sparse: true,
    },
    rollNo: {
      type: String,
      unique: true,
      sparse: true,
    },

    employeeId: {
      type: String,
      unique: true,
      sparse: true,
    },

    department: {
      type: String,
    },

    semester: {
      type: Number,
    },

    // Kept for existing student records only. New teacher functionality uses field.
    section: {
      type: String,
    },

    field: {
      type: String,
      enum: ['CSE', 'AIML'],
      uppercase: true,
      trim: true,
    },

    phone: String,
    designation: String,
    qualification: String,

    assignedSubjects: [
      {
        name: { type: String, required: true, trim: true },
        code: { type: String, required: true, trim: true },
        semester: { type: Number, required: true },
        field: { type: String, enum: ['CSE', 'AIML'], required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
)

const User = mongoose.model('User', userSchema)

export default User
