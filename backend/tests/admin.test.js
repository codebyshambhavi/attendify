require('dotenv').config({ path: require('path').join(__dirname, '../.env.example') });
process.env.JWT_SECRET = 'test_secret_key_for_jest';
process.env.JWT_EXPIRES_IN = '1h';

require('./setup');
const request      = require('supertest');
const express      = require('express');
const authRoutes   = require('../src/routes/auth');
const adminRoutes  = require('../src/routes/admin');
const attRoutes    = require('../src/routes/attendance');
const User         = require('../src/models/User');

const app = express();
app.use(express.json());
app.use('/api/auth',       authRoutes);
app.use('/api/admin',      adminRoutes);
app.use('/api/attendance', attRoutes);

// ── Helpers ───────────────────────────────────────────────────────────────────
const createAdmin = async () => {
  const admin = await User.create({
    name: 'Admin', email: 'admin@test.com',
    password: 'Admin@123', role: 'faculty',
  });
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@test.com', password: 'Admin@123' });
  return { admin, token: res.body.token };
};

const createStudent = async (email = 'student@test.com') => {
  const res = await request(app)
    .post('/api/auth/signup')
    .send({ name: 'Student', email, password: 'pass123' });
  return { student: res.body.user, token: res.body.token };
};

// ── Access control ─────────────────────────────────────────────────────────────
describe('Admin route access control', () => {
  it('blocks unauthenticated request', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.statusCode).toBe(401);
  });

  it('blocks student from admin routes', async () => {
    const { token } = await createStudent();
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(403);
  });

  it('allows admin access', async () => {
    const { token } = await createAdmin();
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});

// ── User management ───────────────────────────────────────────────────────────
describe('GET /api/admin/users', () => {
  it('returns only student users', async () => {
    const { token } = await createAdmin();
    await createStudent('s1@test.com');
    await createStudent('s2@test.com');

    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    expect(res.body.every((u) => u.role === 'student')).toBe(true);
  });

  it('searches by name', async () => {
    const { token } = await createAdmin();
    await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Findable Unique', email: 'unique@test.com', password: 'pass123' });

    const res = await request(app)
      .get('/api/admin/users?search=Findable')
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('Findable Unique');
  });
});

describe('PUT /api/admin/users/:id', () => {
  it('updates user department', async () => {
    const { token } = await createAdmin();
    const { student } = await createStudent();

    const res = await request(app)
      .put(`/api/admin/users/${student._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ department: 'Physics' });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.department).toBe('Physics');
  });

  it('can promote to faculty via updateUser', async () => {
    const { token } = await createAdmin();
    const { student } = await createStudent();

    const res = await request(app)
      .put(`/api/admin/users/${student._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ role: 'faculty' });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.role).toBe('faculty');
  });
});

describe('DELETE /api/admin/users/:id', () => {
  it('deletes a student', async () => {
    const { token } = await createAdmin();
    const { student } = await createStudent();

    const res = await request(app)
      .delete(`/api/admin/users/${student._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  it('prevents admin from deleting themselves', async () => {
    const { admin, token } = await createAdmin();

    const res = await request(app)
      .delete(`/api/admin/users/${admin._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/cannot delete your own/i);
  });
});

// ── Stats ──────────────────────────────────────────────────────────────────────
describe('GET /api/admin/stats', () => {
  it('returns dashboard stats', async () => {
    const { token } = await createAdmin();

    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('totalUsers');
    expect(res.body).toHaveProperty('todayPresent');
    expect(res.body).toHaveProperty('monthAttendanceRate');
  });
});

// ── Bulk mark ──────────────────────────────────────────────────────────────────
describe('POST /api/admin/attendance/bulk-mark', () => {
  it('marks multiple students at once', async () => {
    const { token } = await createAdmin();
    const { student: s1 } = await createStudent('bulk1@test.com');
    const { student: s2 } = await createStudent('bulk2@test.com');

    const today = new Date().toISOString().split('T')[0];
    const res = await request(app)
      .post('/api/admin/attendance/bulk-mark')
      .set('Authorization', `Bearer ${token}`)
      .send({ userIds: [s1._id, s2._id], date: today, status: 'absent' });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/2 students/i);
  });

  it('validates required fields', async () => {
    const { token } = await createAdmin();
    const res = await request(app)
      .post('/api/admin/attendance/bulk-mark')
      .set('Authorization', `Bearer ${token}`)
      .send({ userIds: [], date: '2024-01-01', status: 'present' });

    expect(res.statusCode).toBe(400);
  });
});
