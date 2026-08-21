import mongoose from 'mongoose'

const assignmentSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subjectAssignment: { type: mongoose.Schema.Types.ObjectId, required: true },
  subject: { type: String, required: true, trim: true },
  code: { type: String, required: true, trim: true },
  semester: { type: Number, required: true },
  field: { type: String, enum: ['CSE', 'AIML'], required: true },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, required: true, trim: true, maxlength: 5000 },
  deadline: { type: Date, required: true },
  attachmentUrl: { type: String, trim: true, default: '' },
  maximumMarks: { type: Number, required: true, min: 1, max: 100 },
  isPublished: { type: Boolean, default: false },
  publishedAt: Date,
}, { timestamps: true })

const Assignment = mongoose.model('Assignment', assignmentSchema)

export default Assignment
