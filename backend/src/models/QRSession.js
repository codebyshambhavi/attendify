const mongoose = require('mongoose');

const qrSessionSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true },
    subject: { type: String, required: true },
    date: { type: String, required: true },           // "YYYY-MM-DD"
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    scannedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('QRSession', qrSessionSchema);
