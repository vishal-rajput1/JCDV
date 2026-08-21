import mongoose from 'mongoose'

const timetableEntrySchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subjectAssignment: { type: mongoose.Schema.Types.ObjectId, required: true },
  subject: { type: String, required: true, trim: true },
  code: { type: String, required: true, trim: true },
  semester: { type: Number, required: true },
  field: { type: String, enum: ['CSE', 'AIML'], required: true },
  day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], required: true },
  startTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  endTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  room: { type: String, required: true, trim: true },
}, { timestamps: true })

timetableEntrySchema.index({ teacher: 1, day: 1, startTime: 1 })

const TimetableEntry = mongoose.model('TimetableEntry', timetableEntrySchema)

export default TimetableEntry
