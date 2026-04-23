const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // "YYYY-MM-DD" — easy filtering
    status: { type: String, enum: ['present', 'absent', 'late'], default: 'present' },
    markedVia: { type: String, enum: ['manual', 'qr', 'admin'], default: 'manual' },
    markedAt: { type: Date, default: Date.now },
    note: { type: String, trim: true },
    subject: { type: String, trim: true },
  },
  { timestamps: true }
);

// One record per user per date per subject
attendanceSchema.index({ user: 1, date: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
