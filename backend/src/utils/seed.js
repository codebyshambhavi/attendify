require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Attendance = require('../models/Attendance');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing
  await User.deleteMany({});
  await Attendance.deleteMany({});

  // Create admin
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@attendify.com',
    password: 'Admin@123',
    role: 'admin',
  });

  // Create sample students
  const students = await User.create([
    { name: 'Alice Johnson', email: 'alice@attendify.com', password: 'Student@123', studentId: 'CS001', department: 'Computer Science' },
    { name: 'Bob Smith', email: 'bob@attendify.com', password: 'Student@123', studentId: 'CS002', department: 'Computer Science' },
    { name: 'Carol White', email: 'carol@attendify.com', password: 'Student@123', studentId: 'EC001', department: 'Electronics' },
  ]);

  // Seed last 10 days of attendance
  const records = [];
  for (let i = 9; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toISOString().split('T')[0];
    for (const student of students) {
      records.push({
        user: student._id,
        date,
        status: Math.random() > 0.2 ? 'present' : 'absent',
        subject: 'General',
        markedVia: 'admin',
      });
    }
  }
  await Attendance.insertMany(records);

  console.log('✅ Seeded:');
  console.log('   Admin  → admin@attendify.com  / Admin@123');
  console.log('   Student→ alice@attendify.com  / Student@123');
  process.exit(0);
};

seed().catch((err) => { console.error(err); process.exit(1); });
