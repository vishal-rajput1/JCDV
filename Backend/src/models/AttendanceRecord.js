import mongoose from 'mongoose'

const entrySchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  present: { type: Boolean, required: true },
}, { _id: false })

const attendanceRecordSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subjectAssignment: { type: mongoose.Schema.Types.ObjectId, required: true },
  subject: { type: String, required: true, trim: true },
  code: { type: String, required: true, trim: true },
  semester: { type: Number, required: true },
  field: { type: String, enum: ['CSE', 'AIML'], required: true },
  date: { type: Date, required: true },
  entries: { type: [entrySchema], required: true },
}, { timestamps: true })

attendanceRecordSchema.index({ teacher: 1, subjectAssignment: 1, date: 1 }, { unique: true })

const AttendanceRecord = mongoose.model('AttendanceRecord', attendanceRecordSchema)

export default AttendanceRecord
