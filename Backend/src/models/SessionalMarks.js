import mongoose from 'mongoose'

const sessionalMarksSchema = new mongoose.Schema(
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

    sessional1: {
      type: Number,
      default: 0,
      min: 0,
      max: 20,
    },

    sessional2: {
      type: Number,
      default: 0,
      min: 0,
      max: 20,
    },

    sessional3: {
      type: Number,
      default: 0,
      min: 0,
      max: 20,
    },

    assignment: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    sessional1Max: {
      type: Number,
      default: 20,
    },

    sessional2Max: {
      type: Number,
      default: 20,
    },

    sessional3Max: {
      type: Number,
      default: 20,
    },

    assignmentMax: {
      type: Number,
      default: 10,
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

const SessionalMarks = mongoose.model(
  'SessionalMarks',
  sessionalMarksSchema
)

export default SessionalMarks
