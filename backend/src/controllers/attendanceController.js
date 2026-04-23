const Attendance = require('../models/Attendance');

// POST /api/attendance/mark
const markAttendance = async (req, res) => {
  const { date, status = 'present', subject = 'General', note } = req.body;

  if (!date) return res.status(400).json({ message: 'Date is required' });

  try {
    const record = await Attendance.findOneAndUpdate(
      { user: req.user._id, date, subject },
      { status, note, markedVia: 'manual', markedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json({ record });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Attendance already marked for this date/subject' });
    }
    res.status(500).json({ message: err.message });
  }
};

// GET /api/attendance/my
const getMyAttendance = async (req, res) => {
  try {
    // Placeholder dashboard payload until DB-backed analytics are implemented.
    const totalClasses = 24;
    const attended = 21;
    const percentage = totalClasses ? Math.round((attended / totalClasses) * 100) : 0;

    return res.json({
      stats: {
        totalClasses,
        attended,
        percentage,
      },
      records: [],
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Failed to fetch attendance dashboard data',
      error: err.message,
    });
  }
};

// GET /api/attendance/today
const getTodayStatus = async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  try {
    const record = await Attendance.findOne({ user: req.user._id, date: today });
    res.json({ record, date: today });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { markAttendance, getMyAttendance, getTodayStatus };
