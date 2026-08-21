import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['assignment_submission', 'student_request', 'admin_announcement', 'attendance', 'schedule_change', 'system'], required: true },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  message: { type: String, required: true, trim: true, maxlength: 1000 },
  referenceType: { type: String, trim: true },
  referenceId: { type: mongoose.Schema.Types.ObjectId },
  isRead: { type: Boolean, default: false, index: true },
  readAt: Date,
}, { timestamps: true })

notificationSchema.index({ recipient: 1, createdAt: -1 })

const Notification = mongoose.model('Notification', notificationSchema)

export default Notification
