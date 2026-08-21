import mongoose from 'mongoose'

const studentRequestSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subjectAssignment: { type: mongoose.Schema.Types.ObjectId },
  subject: { type: String, trim: true },
  semester: { type: Number, required: true },
  field: { type: String, enum: ['CSE', 'AIML'], required: true },
  type: { type: String, enum: ['attendance_correction', 'assignment_extension', 'academic'], required: true },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  details: { type: String, required: true, trim: true, maxlength: 4000 },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending', index: true },
  teacherNote: { type: String, trim: true, maxlength: 2000, default: '' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
}, { timestamps: true })

const StudentRequest = mongoose.model('StudentRequest', studentRequestSchema)

export default StudentRequest
