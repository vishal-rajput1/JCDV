import mongoose from 'mongoose'

const announcementSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  message: { type: String, required: true, trim: true, maxlength: 5000 },
  audience: { type: String, enum: ['all', 'subject', 'semester', 'field'], required: true },
  subjectAssignment: { type: mongoose.Schema.Types.ObjectId },
  subject: { type: String, trim: true },
  code: { type: String, trim: true },
  semester: Number,
  field: { type: String, enum: ['CSE', 'AIML'] },
  publishDate: { type: Date, required: true },
  isPublished: { type: Boolean, default: false },
  publishedAt: Date,
}, { timestamps: true })

const Announcement = mongoose.model('Announcement', announcementSchema)

export default Announcement
