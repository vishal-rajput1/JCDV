import mongoose from 'mongoose'

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      trim: true,
    },

    present: {
      type: Number,
      default: 0,
      min: 0,
    },

    total: {
      type: Number,
      default: 0,
      min: 0,
    },

    color: {
      type: String,
      default: 'bg-blue-500',
    },

    semester: {
      type: Number,
      required: true,
    },

    field: {
      type: String,
      enum: ['CSE', 'AIML'],
    },
  },
  {
    timestamps: true,
  }
)

const Attendance = mongoose.model(
  'Attendance',
  attendanceSchema
)

export default Attendance
