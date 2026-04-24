const User = require('../models/User');
const Attendance = require('../models/Attendance');
const { Parser } = require('json2csv');
const { generateAttendancePDF } = require('../utils/exportPDF');

// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = { role: 'student' };

    if (search) {
      filter.$or = [
        { name:      { $regex: search, $options: 'i' } },
        { email:     { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ name: 1 });

    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PUT /api/admin/users/:id
const updateUser = async (req, res) => {
  try {
    const allowed = ['name','role','studentId','department','isActive'];
    const update  = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    if (update.role === 'admin') update.role = 'faculty';
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    if (req.params.id === String(req.user._id))
      return res.status(400).json({ message: 'You cannot delete your own account' });
    await User.findByIdAndDelete(req.params.id);
    await Attendance.deleteMany({ user: req.params.id });
    res.json({ message: 'User and their attendance records deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/admin/attendance?userId=&date=&month=&status=&page=&limit=
const getAllAttendance = async (req, res) => {
  try {
    const { userId, date, month, status, page = 1, limit = 100 } = req.query;
    const filter = {};
    if (userId) filter.user   = userId;
    if (date)   filter.date   = date;
    if (month)  filter.date   = { $regex: `^${month}` };
    if (status) filter.status = status;
    const [records, total] = await Promise.all([
      Attendance.find(filter)
        .populate('user', 'name email studentId department')
        .sort({ date: -1 })
        .skip((page-1)*limit)
        .limit(Number(limit)),
      Attendance.countDocuments(filter),
    ]);
    res.json({ records, total, page: Number(page) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PUT /api/admin/attendance/:id
const updateAttendance = async (req, res) => {
  try {
    const allowed = ['status','note','subject'];
    const update  = { ...Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k))), markedVia: 'admin' };
    const record  = await Attendance.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json({ record });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/admin/attendance/bulk-mark
const bulkMark = async (req, res) => {
  const { userIds, date, status, subject = 'General' } = req.body;
  try {
    const ops = userIds.map((uid) => ({
      updateOne: {
        filter: { user: uid, date, subject },
        update: { $set: { status, markedVia: 'admin', markedAt: new Date() } },
        upsert: true,
      },
    }));
    const result = await Attendance.bulkWrite(ops);
    res.json({ message: `Marked ${userIds.length} students as ${status}`, upserted: result.upsertedCount, modified: result.modifiedCount });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/admin/export/csv?month=YYYY-MM
const exportCSV = async (req, res) => {
  try {
    const filter = {};
    if (req.query.month)  filter.date = { $regex: `^${req.query.month}` };
    if (req.query.userId) filter.user = req.query.userId;
    const records = await Attendance.find(filter)
      .populate('user', 'name email studentId department')
      .sort({ date: 1 });
    if (!records.length) return res.status(404).json({ message: 'No records found' });
    const data = records.map((r) => ({
      Name: r.user?.name||'', Email: r.user?.email||'',
      'Student ID': r.user?.studentId||'', Department: r.user?.department||'',
      Date: r.date, Status: r.status, Subject: r.subject||'General',
      'Marked Via': r.markedVia, Note: r.note||'',
    }));
    const csv = new Parser().parse(data);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="attendance-${req.query.month||'all'}.csv"`);
    res.send(csv);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/admin/export/pdf?month=YYYY-MM
const exportPDF = async (req, res) => {
  try {
    const filter = {};
    if (req.query.month)  filter.date = { $regex: `^${req.query.month}` };
    if (req.query.userId) filter.user = req.query.userId;
    const records = await Attendance.find(filter)
      .populate('user', 'name email studentId department')
      .sort({ date: 1 });
    if (!records.length) return res.status(404).json({ message: 'No records found' });
    generateAttendancePDF(records, req.query.month || 'All Time', res);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.slice(0, 7);
    const [totalUsers, todayRecords, monthRecords] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Attendance.find({ date: today }),
      Attendance.find({ date: { $regex: `^${currentMonth}` } }),
    ]);
    const todayPresent  = todayRecords.filter((r) => r.status === 'present' || r.status === 'late').length;
    const monthPresent  = monthRecords.filter((r) => r.status === 'present' || r.status === 'late').length;
    res.json({
      totalUsers, todayPresent, todayAbsent: todayRecords.length - todayPresent,
      monthTotal: monthRecords.length,
      monthAttendanceRate: monthRecords.length ? Math.round((monthPresent/monthRecords.length)*100) : 0,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/admin/user-stats/:id
const getUserStats = async (req, res) => {
  try {
    const records = await Attendance.find({ user: req.params.id }).sort({ date: -1 });
    const total   = records.length;
    const present = records.filter((r) => r.status === 'present').length;
    const absent  = records.filter((r) => r.status === 'absent').length;
    const late    = records.filter((r) => r.status === 'late').length;
    res.json({ total, present, absent, late, percentage: total ? Math.round(((present+late)/total)*100) : 0, records: records.slice(0,30) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getUsers, updateUser, deleteUser, getAllAttendance, updateAttendance, bulkMark, exportCSV, exportPDF, getStats, getUserStats };
