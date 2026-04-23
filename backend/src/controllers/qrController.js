const crypto = require('crypto');
const QRCode = require('qrcode');
const QRSession = require('../models/QRSession');
const Attendance = require('../models/Attendance');

// POST /api/qr/generate  (admin only)
const generateQR = async (req, res) => {
  const { subject, expiresInMinutes = 15 } = req.body;
  const date = new Date().toISOString().split('T')[0];

  try {
    const token = crypto.randomBytes(20).toString('hex');
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    const session = await QRSession.create({
      token,
      subject: subject || 'General',
      date,
      createdBy: req.user._id,
      expiresAt,
    });

    // Encode the scan URL into a QR image (data URI)
    const scanUrl = `${process.env.CLIENT_URL}/scan/${token}`;
    const qrImage = await QRCode.toDataURL(scanUrl, { width: 300 });

    res.json({ session, qrImage, scanUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/qr/scan/:token  (student)
const scanQR = async (req, res) => {
  try {
    const session = await QRSession.findOne({ token: req.params.token });

    if (!session) return res.status(404).json({ message: 'Invalid QR code' });
    if (!session.isActive) return res.status(400).json({ message: 'QR session expired or closed' });
    if (new Date() > session.expiresAt) {
      session.isActive = false;
      await session.save();
      return res.status(400).json({ message: 'QR code has expired' });
    }
    if (session.scannedBy.includes(req.user._id)) {
      return res.status(409).json({ message: 'You already scanned this QR code' });
    }

    // Mark attendance
    const record = await Attendance.findOneAndUpdate(
      { user: req.user._id, date: session.date, subject: session.subject },
      { status: 'present', markedVia: 'qr', markedAt: new Date() },
      { upsert: true, new: true }
    );

    session.scannedBy.push(req.user._id);
    await session.save();

    res.json({ message: 'Attendance marked via QR!', record });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/qr/sessions  (admin)
const getSessions = async (req, res) => {
  try {
    const sessions = await QRSession.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('scannedBy', 'name email');
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { generateQR, scanQR, getSessions };
