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

// GET /api/attendance/my  ?month=2024-04
const getMyAttendance = async (req, res) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.month) {
      filter.date = { $regex: `^${req.query.month}` };
    }

    const records = await Attendance.find(filter).sort({ date: -1 });

    // Compute stats
    const total = records.length;
    const present = records.filter((r) => r.status === 'present').length;
    const late = records.filter((r) => r.status === 'late').length;
    const absent = records.filter((r) => r.status === 'absent').length;
    const percentage = total ? Math.round(((present + late) / total) * 100) : 0;

    res.json({ records, stats: { total, present, late, absent, percentage } });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
